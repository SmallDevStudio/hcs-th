import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { ABOUT_PAGE_ID, ABOUT_SECTION_TYPES } from "@/constants/about";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import { InvalidRequestError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { prepareAboutPageRelationships } from "@/services/about/about-relationships.service";
import { getAboutPage } from "@/services/about/about-query.service";
import { writeAuditLog } from "@/services/audit/audit.service";

function assertExpectedDraftVersion({
  expectedDraftVersion,
  currentDraftVersion,
}) {
  if (!Number.isInteger(expectedDraftVersion) || expectedDraftVersion < 0) {
    throw new InvalidRequestError(
      "A valid About page draft version is required",
      {
        field: "expectedDraftVersion",
      },
    );
  }

  if (expectedDraftVersion !== currentDraftVersion) {
    throw new InvalidRequestError(
      "The About page has been updated by another user. Reload before saving.",
      {
        code: "ABOUT_DRAFT_VERSION_CONFLICT",
        expectedDraftVersion,
        currentDraftVersion,
      },
    );
  }
}

function assertPublishableDraft(draft) {
  if (!draft) {
    throw new InvalidRequestError("About page draft has not been created");
  }

  const missingFields = [];

  if (!draft.seo?.title?.en?.trim()) {
    missingFields.push("seo.title.en");
  }

  if (!draft.seo?.title?.th?.trim()) {
    missingFields.push("seo.title.th");
  }

  const enabledSections = Array.isArray(draft.sections)
    ? draft.sections.filter((section) => section.enabled !== false)
    : [];

  if (!enabledSections.length) {
    missingFields.push("sections");
  }

  const heroSections = enabledSections.filter(
    (section) => section.type === ABOUT_SECTION_TYPES.HERO,
  );

  if (!heroSections.length) {
    missingFields.push("sections.hero");
  }

  for (const section of enabledSections) {
    if (!section.title?.en?.trim()) {
      missingFields.push(`sections.${section.id}.title.en`);
    }

    if (!section.title?.th?.trim()) {
      missingFields.push(`sections.${section.id}.title.th`);
    }
  }

  if (missingFields.length) {
    throw new InvalidRequestError(
      "About page is incomplete and cannot be published",
      {
        missingFields,
      },
    );
  }
}

function createPageAuditSnapshot(data = {}) {
  return {
    pageType: data.pageType || ABOUT_PAGE_ID,
    draftVersion: Number(data.draftVersion || 0),
    publishedVersion: Number(data.publishedVersion || 0),
    draft: data.draft || null,
    published: data.published || null,
  };
}

export async function saveAboutDraft({
  input,
  expectedDraftVersion,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.PAGES).doc(ABOUT_PAGE_ID);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    const before = snapshot.exists ? snapshot.data() : null;

    const currentDraftVersion = Number(before?.draftVersion || 0);

    assertExpectedDraftVersion({
      expectedDraftVersion,
      currentDraftVersion,
    });

    const relationships = await prepareAboutPageRelationships({
      transaction,

      previousDraft: before?.draft || null,
      previousPublished: before?.published || null,

      nextDraft: input,
      nextPublished: before?.published || null,

      actor,
    });

    const nextDraftVersion = currentDraftVersion + 1;

    const nextDraft = {
      ...relationships.draft,

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    const writeData = {
      pageType: ABOUT_PAGE_ID,

      draftVersion: nextDraftVersion,
      publishedVersion: Number(before?.publishedVersion || 0),

      draft: nextDraft,
      published: relationships.published,

      isDeleted: false,
      deletedAt: null,
      deletedBy: null,

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    if (!snapshot.exists) {
      writeData.createdAt = FieldValue.serverTimestamp();
      writeData.createdBy = actor.uid;
    }

    relationships.apply();

    transaction.set(reference, writeData, {
      merge: snapshot.exists,
    });

    await writeAuditLog({
      actor,

      action: snapshot.exists
        ? AUDIT_ACTIONS.PAGE_UPDATE
        : AUDIT_ACTIONS.PAGE_CREATE,

      entityType: AUDIT_ENTITY_TYPES.PAGE,
      entityId: ABOUT_PAGE_ID,

      before: before ? createPageAuditSnapshot(before) : null,

      after: createPageAuditSnapshot({
        ...before,
        ...writeData,
      }),

      metadata: {
        ...requestMetadata,
        page: ABOUT_PAGE_ID,
        operation: "save-draft",
        draftVersion: nextDraftVersion,
      },

      transaction,
    });
  });

  return getAboutPage();
}

export async function publishAboutPage({
  expectedDraftVersion,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.PAGES).doc(ABOUT_PAGE_ID);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new NotFoundError("About page draft not found");
    }

    const before = snapshot.data();

    const currentDraftVersion = Number(before.draftVersion || 0);

    assertExpectedDraftVersion({
      expectedDraftVersion,
      currentDraftVersion,
    });

    assertPublishableDraft(before.draft);

    const publishedContent = structuredClone(before.draft);

    delete publishedContent.updatedAt;
    delete publishedContent.updatedBy;
    delete publishedContent.publishedAt;
    delete publishedContent.publishedBy;

    const relationships = await prepareAboutPageRelationships({
      transaction,

      previousDraft: before.draft,
      previousPublished: before.published || null,

      nextDraft: before.draft,
      nextPublished: publishedContent,

      actor,
    });

    const nextPublished = {
      ...relationships.published,

      publishedAt: FieldValue.serverTimestamp(),
      publishedBy: actor.uid,

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    const updates = {
      draft: relationships.draft,
      published: nextPublished,

      publishedVersion: currentDraftVersion,

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    relationships.apply();

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.PAGE_PUBLISH,

      entityType: AUDIT_ENTITY_TYPES.PAGE,
      entityId: ABOUT_PAGE_ID,

      before: createPageAuditSnapshot(before),

      after: createPageAuditSnapshot({
        ...before,
        ...updates,
      }),

      metadata: {
        ...requestMetadata,
        page: ABOUT_PAGE_ID,
        operation: "publish",
        publishedVersion: currentDraftVersion,
      },

      transaction,
    });
  });

  return getAboutPage();
}

export async function unpublishAboutPage({ actor, requestMetadata = {} }) {
  const reference = adminDb.collection(COLLECTIONS.PAGES).doc(ABOUT_PAGE_ID);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new NotFoundError("About page not found");
    }

    const before = snapshot.data();

    if (!before.published) {
      throw new InvalidRequestError("About page is not currently published");
    }

    const relationships = await prepareAboutPageRelationships({
      transaction,

      previousDraft: before.draft || null,
      previousPublished: before.published,

      nextDraft: before.draft || null,
      nextPublished: null,

      actor,
    });

    const updates = {
      draft: relationships.draft,
      published: null,

      publishedVersion: 0,

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    relationships.apply();

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.PAGE_UNPUBLISH,

      entityType: AUDIT_ENTITY_TYPES.PAGE,
      entityId: ABOUT_PAGE_ID,

      before: createPageAuditSnapshot(before),

      after: createPageAuditSnapshot({
        ...before,
        ...updates,
      }),

      metadata: {
        ...requestMetadata,
        page: ABOUT_PAGE_ID,
        operation: "unpublish",
      },

      transaction,
    });
  });

  return getAboutPage();
}
