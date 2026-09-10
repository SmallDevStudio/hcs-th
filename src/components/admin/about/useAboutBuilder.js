"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  cloneAboutDraft,
  createAboutDraft,
  normalizeAboutSortOrders,
} from "@/modules/about/about.factory";
import {
  getAboutPage,
  publishAboutPage,
  saveAboutPageDraft,
  unpublishAboutPage,
} from "@/services/http/about.api";

const DEFAULT_AUTOSAVE_DELAY = 1500;

function getInitialDraft(page) {
  return cloneAboutDraft(page?.draft || createAboutDraft());
}

function isVersionConflict(error) {
  return (
    error?.code === "ABOUT_DRAFT_VERSION_CONFLICT" ||
    error?.details?.code === "ABOUT_DRAFT_VERSION_CONFLICT"
  );
}

function draftsAreEqual(firstDraft, secondDraft) {
  return JSON.stringify(firstDraft) === JSON.stringify(secondDraft);
}

export function useAboutBuilder({
  initialPage,
  autosave = true,
  autosaveDelay = DEFAULT_AUTOSAVE_DELAY,
  onSaved,
  onPublished,
  onUnpublished,
  onError,
  onVersionConflict,
} = {}) {
  const [page, setPage] = useState(initialPage);

  const [draft, setDraft] = useState(() => getInitialDraft(initialPage));

  const [dirty, setDirty] = useState(false);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [publishing, setPublishing] = useState(false);

  const [unpublishing, setUnpublishing] = useState(false);

  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [error, setError] = useState(null);

  const [versionConflict, setVersionConflict] = useState(null);

  const pageRef = useRef(initialPage);

  const draftRef = useRef(getInitialDraft(initialPage));

  const revisionRef = useRef(0);

  const saveInProgressRef = useRef(false);

  const autosaveTimerRef = useRef(null);

  const mountedRef = useRef(true);

  const saveDraftRef = useRef(null);

  const clearAutosaveTimer = useCallback(() => {
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);

      autosaveTimerRef.current = null;
    }
  }, []);

  const reportError = useCallback(
    (nextError) => {
      if (!mountedRef.current) {
        return;
      }

      setError(nextError);

      if (isVersionConflict(nextError)) {
        setVersionConflict(nextError);

        if (typeof onVersionConflict === "function") {
          onVersionConflict(nextError);
        }
      }

      if (typeof onError === "function") {
        onError(nextError);
      }
    },
    [onError, onVersionConflict],
  );

  const scheduleAutosave = useCallback(() => {
    if (!autosave) {
      return;
    }

    clearAutosaveTimer();

    autosaveTimerRef.current = window.setTimeout(() => {
      autosaveTimerRef.current = null;

      const savePromise = saveDraftRef.current?.();

      if (savePromise && typeof savePromise.catch === "function") {
        savePromise.catch(() => {
          // Error state and notifications are handled by saveDraft.
        });
      }
    }, autosaveDelay);
  }, [autosave, autosaveDelay, clearAutosaveTimer]);

  const replacePage = useCallback((nextPage, options = {}) => {
    pageRef.current = nextPage;

    setPage(nextPage);

    if (options.replaceDraft !== false) {
      const nextDraft = getInitialDraft(nextPage);

      draftRef.current = nextDraft;

      setDraft(nextDraft);
    }
  }, []);

  const updateDraft = useCallback(
    (updater) => {
      const currentDraft = draftRef.current;

      const candidateDraft =
        typeof updater === "function"
          ? updater(cloneAboutDraft(currentDraft))
          : updater;

      const normalizedDraft = normalizeAboutSortOrders(candidateDraft);

      if (draftsAreEqual(currentDraft, normalizedDraft)) {
        return currentDraft;
      }

      revisionRef.current += 1;

      draftRef.current = normalizedDraft;

      setDraft(normalizedDraft);

      setDirty(true);

      setError(null);

      setVersionConflict(null);

      scheduleAutosave();

      return normalizedDraft;
    },
    [scheduleAutosave],
  );

  const saveDraft = useCallback(async () => {
    if (saveInProgressRef.current) {
      return null;
    }

    clearAutosaveTimer();

    const currentPage = pageRef.current;

    const capturedDraft = cloneAboutDraft(draftRef.current);

    const capturedRevision = revisionRef.current;

    saveInProgressRef.current = true;

    setSaving(true);

    setError(null);

    setVersionConflict(null);

    try {
      const savedPage = await saveAboutPageDraft({
        values: capturedDraft,

        expectedDraftVersion: Number(currentPage?.draftVersion || 0),
      });

      if (!mountedRef.current) {
        return savedPage;
      }

      pageRef.current = savedPage;

      setPage(savedPage);

      setLastSavedAt(new Date());

      if (revisionRef.current === capturedRevision) {
        const savedDraft = getInitialDraft(savedPage);

        draftRef.current = savedDraft;

        setDraft(savedDraft);

        setDirty(false);
      } else {
        setDirty(true);

        scheduleAutosave();
      }

      if (typeof onSaved === "function") {
        onSaved(savedPage);
      }

      return savedPage;
    } catch (saveError) {
      reportError(saveError);

      throw saveError;
    } finally {
      saveInProgressRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [clearAutosaveTimer, onSaved, reportError, scheduleAutosave]);

  const reload = useCallback(async () => {
    clearAutosaveTimer();

    setLoading(true);

    setError(null);

    try {
      const loadedPage = await getAboutPage();

      if (!mountedRef.current) {
        return loadedPage;
      }

      replacePage(loadedPage);

      revisionRef.current += 1;

      setDirty(false);

      setVersionConflict(null);

      return loadedPage;
    } catch (loadError) {
      reportError(loadError);

      throw loadError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [clearAutosaveTimer, replacePage, reportError]);

  const publish = useCallback(async () => {
    clearAutosaveTimer();

    setPublishing(true);

    setError(null);

    try {
      let currentPage = pageRef.current;

      if (dirty) {
        const savedPage = await saveDraft();

        if (savedPage) {
          currentPage = savedPage;
        }
      }

      const publishedPage = await publishAboutPage({
        expectedDraftVersion: Number(currentPage?.draftVersion || 0),
      });

      if (!mountedRef.current) {
        return publishedPage;
      }

      replacePage(publishedPage);

      setDirty(false);

      setVersionConflict(null);

      if (typeof onPublished === "function") {
        onPublished(publishedPage);
      }

      return publishedPage;
    } catch (publishError) {
      reportError(publishError);

      throw publishError;
    } finally {
      if (mountedRef.current) {
        setPublishing(false);
      }
    }
  }, [
    clearAutosaveTimer,
    dirty,
    onPublished,
    replacePage,
    reportError,
    saveDraft,
  ]);

  const unpublish = useCallback(async () => {
    clearAutosaveTimer();

    setUnpublishing(true);

    setError(null);

    try {
      const unpublishedPage = await unpublishAboutPage();

      if (!mountedRef.current) {
        return unpublishedPage;
      }

      replacePage(unpublishedPage, {
        replaceDraft: false,
      });

      if (typeof onUnpublished === "function") {
        onUnpublished(unpublishedPage);
      }

      return unpublishedPage;
    } catch (unpublishError) {
      reportError(unpublishError);

      throw unpublishError;
    } finally {
      if (mountedRef.current) {
        setUnpublishing(false);
      }
    }
  }, [clearAutosaveTimer, onUnpublished, replacePage, reportError]);

  useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);

        autosaveTimerRef.current = null;
      }
    };
  }, []);

  return {
    page,
    draft,

    dirty,
    loading,
    saving,
    publishing,
    unpublishing,

    busy: loading || saving || publishing || unpublishing,

    lastSavedAt,
    error,
    versionConflict,

    updateDraft,
    saveDraft,
    reload,
    publish,
    unpublish,
  };
}
