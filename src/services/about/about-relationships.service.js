import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { ABOUT_PAGE_ID } from "@/constants/about";
import { AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import { MEDIA_STATUSES, MEDIA_TYPES } from "@/constants/media";
import { InvalidRequestError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";

function createUsageReference(field) {
  return {
    entityType: AUDIT_ENTITY_TYPES.PAGE,
    entityId: ABOUT_PAGE_ID,
    field,
  };
}

function createReferenceKey(reference) {
  return [
    reference?.entityType || "",
    reference?.entityId || "",
    reference?.field || "",
  ].join(":");
}

function normalizeMediaId(value) {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

function serializeLocalizedText(value) {
  return {
    en: value?.en || "",
    th: value?.th || "",
  };
}

function createMediaSnapshot(snapshot) {
  if (!snapshot?.exists) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    publicUrl: data.publicUrl || null,
    storagePath: data.storagePath || null,
    originalName: data.originalName || "",
    mimeType: data.mimeType || "",
    width: data.width || null,
    height: data.height || null,
    title: serializeLocalizedText(data.title),
    altText: serializeLocalizedText(data.altText),
  };
}

function validateSelectableImage(snapshot) {
  if (!snapshot?.exists) {
    throw new NotFoundError("Selected About page image was not found");
  }

  const data = snapshot.data();

  if (data.isDeleted || data.status !== MEDIA_STATUSES.ACTIVE) {
    throw new InvalidRequestError("Selected About page image is not active");
  }

  if (data.type !== MEDIA_TYPES.IMAGE) {
    throw new InvalidRequestError(
      "Selected About page media asset must be an image",
    );
  }

  if (!data.publicUrl || !data.storagePath) {
    throw new InvalidRequestError("Selected About page image is incomplete");
  }
}

function addMediaReference(references, mediaId, field) {
  const normalizedMediaId = normalizeMediaId(mediaId);

  if (!normalizedMediaId) {
    return;
  }

  references.set(field, {
    mediaId: normalizedMediaId,
    usageReference: createUsageReference(field),
  });
}

function collectContentMediaReferences(content, scope) {
  const references = new Map();

  if (!content) {
    return references;
  }

  addMediaReference(
    references,
    content.seo?.imageMediaId,
    `${scope}.seo.image`,
  );

  const sections = Array.isArray(content.sections) ? content.sections : [];

  for (const section of sections) {
    if (!section?.id) {
      continue;
    }

    addMediaReference(
      references,
      section.imageMediaId,
      `${scope}.sections.${section.id}.image`,
    );

    const items = Array.isArray(section.items) ? section.items : [];

    for (const item of items) {
      if (!item?.id) {
        continue;
      }

      addMediaReference(
        references,
        item.imageMediaId,
        `${scope}.sections.${section.id}.items.${item.id}.image`,
      );
    }
  }

  return references;
}

function collectPageMediaReferences({ draft, published }) {
  return new Map([
    ...collectContentMediaReferences(draft, "draft"),
    ...collectContentMediaReferences(published, "published"),
  ]);
}

function groupReferencesByMediaId(references) {
  const groupedReferences = new Map();

  for (const reference of references.values()) {
    const currentReferences = groupedReferences.get(reference.mediaId) || [];

    currentReferences.push(reference.usageReference);

    groupedReferences.set(reference.mediaId, currentReferences);
  }

  return groupedReferences;
}

function isAboutUsageReference(reference) {
  return (
    reference?.entityType === AUDIT_ENTITY_TYPES.PAGE &&
    reference?.entityId === ABOUT_PAGE_ID &&
    typeof reference?.field === "string" &&
    (reference.field.startsWith("draft.") ||
      reference.field.startsWith("published."))
  );
}

function mergeUsageReferences({ currentReferences, nextAboutReferences }) {
  const referencesByKey = new Map();

  for (const reference of currentReferences) {
    if (!isAboutUsageReference(reference)) {
      referencesByKey.set(createReferenceKey(reference), reference);
    }
  }

  for (const reference of nextAboutReferences) {
    referencesByKey.set(createReferenceKey(reference), reference);
  }

  return [...referencesByKey.values()];
}

function hydrateContent(content, scope, mediaByField) {
  if (!content) {
    return null;
  }

  const hydratedContent = structuredClone(content);

  hydratedContent.seo = {
    ...hydratedContent.seo,

    image: mediaByField.get(`${scope}.seo.image`) || null,
  };

  hydratedContent.sections = (
    Array.isArray(hydratedContent.sections) ? hydratedContent.sections : []
  ).map((section) => {
    const hydratedSection = {
      ...section,

      image: mediaByField.get(`${scope}.sections.${section.id}.image`) || null,
    };

    hydratedSection.items = (
      Array.isArray(section.items) ? section.items : []
    ).map((item) => ({
      ...item,

      image:
        mediaByField.get(
          `${scope}.sections.${section.id}.items.${item.id}.image`,
        ) || null,
    }));

    return hydratedSection;
  });

  return hydratedContent;
}

export async function prepareAboutPageRelationships({
  transaction,
  previousDraft,
  previousPublished,
  nextDraft,
  nextPublished,
  actor,
}) {
  const previousReferences = collectPageMediaReferences({
    draft: previousDraft,
    published: previousPublished,
  });

  const nextReferences = collectPageMediaReferences({
    draft: nextDraft,
    published: nextPublished,
  });

  const previousMediaIds = [...previousReferences.values()].map(
    (reference) => reference.mediaId,
  );

  const nextMediaIds = [...nextReferences.values()].map(
    (reference) => reference.mediaId,
  );

  const mediaIds = [...new Set([...previousMediaIds, ...nextMediaIds])];

  const mediaReferences = mediaIds.map((mediaId) =>
    adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId),
  );

  const mediaSnapshots = mediaReferences.length
    ? await transaction.getAll(...mediaReferences)
    : [];

  const snapshotsById = new Map(
    mediaSnapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  const nextGroupedReferences = groupReferencesByMediaId(nextReferences);

  const nextMediaIdSet = new Set(nextMediaIds);

  for (const mediaId of nextMediaIdSet) {
    validateSelectableImage(snapshotsById.get(mediaId));
  }

  const mediaByField = new Map();

  for (const [field, reference] of nextReferences.entries()) {
    const snapshot = snapshotsById.get(reference.mediaId);

    mediaByField.set(field, createMediaSnapshot(snapshot));
  }

  function apply() {
    for (const mediaId of mediaIds) {
      const snapshot = snapshotsById.get(mediaId);

      if (!snapshot?.exists) {
        continue;
      }

      const data = snapshot.data();

      const currentReferences = Array.isArray(data.usedBy) ? data.usedBy : [];

      const nextAboutReferences = nextGroupedReferences.get(mediaId) || [];

      const nextUsageReferences = mergeUsageReferences({
        currentReferences,
        nextAboutReferences,
      });

      transaction.update(snapshot.ref, {
        usedBy: nextUsageReferences,

        usageCount: nextUsageReferences.length,

        isUsed: nextUsageReferences.length > 0,

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,
      });
    }
  }

  return {
    draft: hydrateContent(nextDraft, "draft", mediaByField),

    published: hydrateContent(nextPublished, "published", mediaByField),

    apply,
  };
}
