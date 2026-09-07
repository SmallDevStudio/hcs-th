import "server-only";

import { AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { InvalidRequestError } from "@/lib/api/errors";
import { prepareMediaUsageTransition } from "@/services/media/media-usage.service";

const SOLUTION_ENTITY_TYPE = AUDIT_ENTITY_TYPES.SOLUTION || "solution";

export const SOLUTION_MEDIA_FIELDS = Object.freeze({
  IMAGE: "image",
});

function normalizeMediaId(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function getSolutionImageMediaId(value = {}) {
  return normalizeMediaId(value.imageMediaId);
}

async function prepareSolutionImageTransition({
  transaction,
  solutionId,
  previousImageMediaId,
  nextImageMediaId,
  actor,
}) {
  if (!transaction) {
    throw new InvalidRequestError(
      "Solution relationship transaction is required",
    );
  }

  if (!solutionId) {
    throw new InvalidRequestError("Solution ID is required");
  }

  if (!actor?.uid) {
    throw new InvalidRequestError("Solution relationship actor is required");
  }

  return prepareMediaUsageTransition({
    transaction,

    previousMediaId: normalizeMediaId(previousImageMediaId),

    nextMediaId: normalizeMediaId(nextImageMediaId),

    entityType: SOLUTION_ENTITY_TYPE,

    entityId: solutionId,

    field: SOLUTION_MEDIA_FIELDS.IMAGE,

    actor,
  });
}

export async function prepareSolutionRelationships({
  transaction,
  solutionId,
  previousData = {},
  nextData,
  actor,
}) {
  if (!nextData) {
    throw new InvalidRequestError("Solution relationship data is required");
  }

  const previousImageMediaId = getSolutionImageMediaId(previousData);

  const nextImageMediaId = getSolutionImageMediaId(nextData);

  const transition = await prepareSolutionImageTransition({
    transaction,

    solutionId,

    previousImageMediaId,

    nextImageMediaId,

    actor,
  });

  return {
    image: transition.image,

    previousImageMediaId,

    nextImageMediaId,

    imageChanged: previousImageMediaId !== nextImageMediaId,

    apply: transition.apply,
  };
}

export async function prepareSolutionRelationshipRelease({
  transaction,
  solutionId,
  solutionData,
  actor,
}) {
  if (!solutionData) {
    throw new InvalidRequestError(
      "Solution data is required to release relationships",
    );
  }

  const previousImageMediaId = getSolutionImageMediaId(solutionData);

  const transition = await prepareSolutionImageTransition({
    transaction,

    solutionId,

    previousImageMediaId,

    nextImageMediaId: null,

    actor,
  });

  return {
    image: null,

    previousImageMediaId,

    nextImageMediaId: null,

    imageChanged: Boolean(previousImageMediaId),

    apply: transition.apply,
  };
}

export async function prepareSolutionRelationshipRestore({
  transaction,
  solutionId,
  solutionData,
  actor,
}) {
  if (!solutionData) {
    throw new InvalidRequestError(
      "Solution data is required to restore relationships",
    );
  }

  const nextImageMediaId = getSolutionImageMediaId(solutionData);

  const transition = await prepareSolutionImageTransition({
    transaction,

    solutionId,

    previousImageMediaId: null,

    nextImageMediaId,

    actor,
  });

  return {
    image: transition.image,

    previousImageMediaId: null,

    nextImageMediaId,

    imageChanged: Boolean(nextImageMediaId),

    apply: transition.apply,
  };
}
