import "server-only";

import { AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { InvalidRequestError } from "@/lib/api/errors";
import { prepareMediaUsageTransition } from "@/services/media/media-usage.service";

const PROJECT_ENTITY_TYPE = AUDIT_ENTITY_TYPES.PROJECT || "project";

export const PROJECT_MEDIA_FIELDS = Object.freeze({
  COVER: "coverImage",
  GALLERY: "gallery",
});

function normalizeMediaId(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function normalizeMediaIds(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.map(normalizeMediaId).filter(Boolean))];
}

function getProjectRelationshipState(value = {}) {
  return {
    coverImageMediaId: normalizeMediaId(value.coverImageMediaId),

    galleryMediaIds: normalizeMediaIds(value.galleryMediaIds),
  };
}

function createEmptyRelationshipState() {
  return {
    coverImageMediaId: null,
    galleryMediaIds: [],
  };
}

async function prepareSingleMediaTransition({
  transaction,
  projectId,
  previousMediaId,
  nextMediaId,
  field,
  actor,
}) {
  return prepareMediaUsageTransition({
    transaction,

    previousMediaId: normalizeMediaId(previousMediaId),

    nextMediaId: normalizeMediaId(nextMediaId),

    entityType: PROJECT_ENTITY_TYPE,

    entityId: projectId,

    field,

    actor,
  });
}

async function prepareGalleryTransitions({
  transaction,
  projectId,
  previousMediaIds,
  nextMediaIds,
  actor,
}) {
  const previousIds = normalizeMediaIds(previousMediaIds);
  const nextIds = normalizeMediaIds(nextMediaIds);

  const allMediaIds = [...new Set([...previousIds, ...nextIds])];

  const transitions = [];

  for (const mediaId of allMediaIds) {
    const existedPreviously = previousIds.includes(mediaId);
    const existsNext = nextIds.includes(mediaId);

    const transition = await prepareSingleMediaTransition({
      transaction,

      projectId,

      previousMediaId: existedPreviously ? mediaId : null,

      nextMediaId: existsNext ? mediaId : null,

      field: PROJECT_MEDIA_FIELDS.GALLERY,

      actor,
    });

    transitions.push({
      mediaId,
      existsNext,
      transition,
    });
  }

  const imagesById = new Map(
    transitions
      .filter(({ existsNext, transition }) => existsNext && transition.image)
      .map(({ mediaId, transition }) => [mediaId, transition.image]),
  );

  return {
    images: nextIds.map((mediaId) => imagesById.get(mediaId)).filter(Boolean),

    previousMediaIds: previousIds,

    nextMediaIds: nextIds,

    changed:
      previousIds.length !== nextIds.length ||
      previousIds.some((mediaId, index) => mediaId !== nextIds[index]),

    apply() {
      for (const { transition } of transitions) {
        transition.apply();
      }
    },
  };
}

async function prepareProjectRelationshipTransition({
  transaction,
  projectId,
  previousData,
  nextData,
  actor,
}) {
  if (!transaction) {
    throw new InvalidRequestError(
      "Project relationship transaction is required",
    );
  }

  if (!projectId) {
    throw new InvalidRequestError("Project ID is required");
  }

  if (!actor?.uid) {
    throw new InvalidRequestError("Project relationship actor is required");
  }

  if (!nextData) {
    throw new InvalidRequestError("Project relationship data is required");
  }

  const previousState = getProjectRelationshipState(previousData);
  const nextState = getProjectRelationshipState(nextData);

  if (
    nextState.coverImageMediaId &&
    nextState.galleryMediaIds.includes(nextState.coverImageMediaId)
  ) {
    throw new InvalidRequestError(
      "Project cover image must not be duplicated in the gallery",
    );
  }

  const coverTransition = await prepareSingleMediaTransition({
    transaction,

    projectId,

    previousMediaId: previousState.coverImageMediaId,

    nextMediaId: nextState.coverImageMediaId,

    field: PROJECT_MEDIA_FIELDS.COVER,

    actor,
  });

  const galleryTransition = await prepareGalleryTransitions({
    transaction,

    projectId,

    previousMediaIds: previousState.galleryMediaIds,

    nextMediaIds: nextState.galleryMediaIds,

    actor,
  });

  return {
    coverImage: coverTransition.image,

    gallery: galleryTransition.images,

    previousCoverImageMediaId: previousState.coverImageMediaId,

    nextCoverImageMediaId: nextState.coverImageMediaId,

    previousGalleryMediaIds: previousState.galleryMediaIds,

    nextGalleryMediaIds: nextState.galleryMediaIds,

    coverChanged:
      previousState.coverImageMediaId !== nextState.coverImageMediaId,

    galleryChanged: galleryTransition.changed,

    apply() {
      coverTransition.apply();
      galleryTransition.apply();
    },
  };
}

export async function prepareProjectRelationships({
  transaction,
  projectId,
  previousData = {},
  nextData,
  actor,
}) {
  return prepareProjectRelationshipTransition({
    transaction,
    projectId,
    previousData,
    nextData,
    actor,
  });
}

export async function prepareProjectRelationshipRelease({
  transaction,
  projectId,
  projectData,
  actor,
}) {
  if (!projectData) {
    throw new InvalidRequestError(
      "Project data is required to release relationships",
    );
  }

  return prepareProjectRelationshipTransition({
    transaction,

    projectId,

    previousData: projectData,

    nextData: createEmptyRelationshipState(),

    actor,
  });
}

export async function prepareProjectRelationshipRestore({
  transaction,
  projectId,
  projectData,
  actor,
}) {
  if (!projectData) {
    throw new InvalidRequestError(
      "Project data is required to restore relationships",
    );
  }

  return prepareProjectRelationshipTransition({
    transaction,

    projectId,

    previousData: createEmptyRelationshipState(),

    nextData: projectData,

    actor,
  });
}
