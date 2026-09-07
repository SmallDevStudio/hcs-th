"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { MediaAssetPicker } from "@/components/admin/media/MediaAssetPicker";
import { MEDIA_FOLDERS } from "@/constants/media";
import { getMediaAssets } from "@/services/http/media.api";

const DEFAULT_PAGINATION = {
  limit: 24,
  count: 0,
  hasMore: false,
  nextCursor: null,
};

function mergeUniqueAssets(currentAssets, incomingAssets) {
  const assetsById = new Map();

  for (const asset of [...currentAssets, ...incomingAssets]) {
    if (asset?.id) {
      assetsById.set(asset.id, asset);
    }
  }

  return [...assetsById.values()];
}

function createPickerLabels(t) {
  return {
    eyebrow: t("solutions.mediaPicker.eyebrow"),

    title: t("solutions.mediaPicker.title"),

    description: t("solutions.mediaPicker.description"),

    libraryTab: t("media.title"),

    uploadTab: t("media.actions.upload"),

    search: t("solutions.mediaPicker.search"),

    searchPlaceholder: t("solutions.mediaPicker.searchPlaceholder"),

    selected: t("solutions.mediaPicker.selected"),

    loading: t("solutions.mediaPicker.loading"),

    empty: t("solutions.mediaPicker.empty"),

    loadMore: t("solutions.mediaPicker.loadMore"),

    cancel: t("solutions.mediaPicker.cancel"),

    close: t("solutions.actions.close"),

    confirm: t("solutions.mediaPicker.useImage"),

    singleSelectionHint: t("solutions.mediaPicker.selectionHint"),

    selectionHint: t("solutions.mediaPicker.selectionHint"),
  };
}

export function SolutionMediaPickerController({
  selectedId = null,
  selectedAsset = null,
  onConfirm,
  onClose,
}) {
  const { t, i18n } = useTranslation("admin");

  const selectedIds = selectedId ? [selectedId] : [];

  const [assets, setAssets] = useState(() =>
    selectedAsset?.id ? [selectedAsset] : [],
  );

  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  const [loading, setLoading] = useState(true);

  const [appliedSearch, setAppliedSearch] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    async function loadInitialAssets() {
      try {
        const result = await getMediaAssets({
          limit: 24,
          type: "image",
          folder: MEDIA_FOLDERS.SOLUTIONS,
          usage: "all",
          signal: abortController.signal,
        });

        setAssets((currentAssets) =>
          mergeUniqueAssets(currentAssets, result.items),
        );

        setPagination(result.pagination);
      } catch (error) {
        if (
          error?.originalError?.code === "ERR_CANCELED" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }

        toast.error(error?.message || t("solutions.messages.mediaLoadFailed"));
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadInitialAssets();

    return () => {
      abortController.abort();
    };
  }, [t]);

  async function requestAssets({ search = "", cursor, append = false } = {}) {
    setLoading(true);

    try {
      const result = await getMediaAssets({
        limit: 24,
        cursor,
        type: "image",
        folder: MEDIA_FOLDERS.SOLUTIONS,
        search: search || undefined,
        usage: "all",
      });

      setAssets((currentAssets) => {
        if (append) {
          return mergeUniqueAssets(currentAssets, result.items);
        }

        const retainedAssets = currentAssets.filter((asset) =>
          selectedIds.includes(asset.id),
        );

        return mergeUniqueAssets(retainedAssets, result.items);
      });

      setPagination(result.pagination);
    } catch (error) {
      toast.error(error?.message || t("solutions.messages.mediaLoadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(search) {
    const normalizedSearch = search.trim();

    setAppliedSearch(normalizedSearch);

    await requestAssets({
      search: normalizedSearch,
    });
  }

  async function handleLoadMore() {
    if (loading || !pagination.nextCursor) {
      return;
    }

    await requestAssets({
      search: appliedSearch,
      cursor: pagination.nextCursor,
      append: true,
    });
  }

  function handleUploaded(uploadedAssets) {
    setAssets((currentAssets) =>
      mergeUniqueAssets(uploadedAssets, currentAssets),
    );

    toast.success(t("media.messages.uploadComplete"));
  }

  return (
    <MediaAssetPicker
      assets={assets}
      pagination={pagination}
      selectedIds={selectedIds}
      multiple={false}
      maximumSelection={1}
      loading={loading}
      locale={i18n.resolvedLanguage || "en"}
      labels={createPickerLabels(t)}
      upload={{
        mediaType: "image",
        defaultFolder: MEDIA_FOLDERS.SOLUTIONS,
        lockFolder: true,
      }}
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      onUploaded={handleUploaded}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
