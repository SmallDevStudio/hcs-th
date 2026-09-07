import "server-only";

import { randomUUID } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import {
  HOME_HERO_DEFAULTS,
  HOME_SECTION_STATUSES,
  HOME_SECTION_TYPES,
} from "@/constants/home";
import { InvalidRequestError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import { prepareHomeHeroRelationships } from "@/services/home/home-hero-relationships.service";
import { getHomeHeroById } from "@/services/home/home-hero-query.service";
import { softDeleteEntity } from "@/services/trash/trash.service";

function normalizeLocalizedValue(value, fallback = "") {
  return {
    en: String(value?.en ?? fallback).trim(),

    th: String(value?.th ?? fallback).trim(),
  };
}

function normalizeMediaId(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function normalizeDateTime(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function normalizeAction(value, fallbackAction) {
  const fallback = fallbackAction || {
    label: {
      en: "",
      th: "",
    },

    href: "",
  };

  return {
    label: normalizeLocalizedValue(value?.label, ""),

    href: String(value?.href ?? fallback.href ?? "").trim(),
  };
}

function normalizeDisplaySchedule(value) {
  return {
    startsAt: normalizeDateTime(value?.startsAt),

    endsAt: normalizeDateTime(value?.endsAt),
  };
}

function normalizeHomeHeroInput(input = {}) {
  return {
    sectionType: HOME_SECTION_TYPES.HERO_SLIDE,

    eyebrow: normalizeLocalizedValue(input.eyebrow),

    titleLineOne: normalizeLocalizedValue(input.titleLineOne),

    titleLineTwo: normalizeLocalizedValue(input.titleLineTwo),

    description: normalizeLocalizedValue(input.description),

    primaryAction: normalizeAction(
      input.primaryAction,
      HOME_HERO_DEFAULTS.primaryAction,
    ),

    secondaryAction: normalizeAction(
      input.secondaryAction,
      HOME_HERO_DEFAULTS.secondaryAction,
    ),

    desktopImageMediaId: normalizeMediaId(input.desktopImageMediaId),

    mobileImageMediaId: normalizeMediaId(input.mobileImageMediaId),

    status: input.status || HOME_HERO_DEFAULTS.status,

    sortOrder: Number(input.sortOrder ?? HOME_HERO_DEFAULTS.sortOrder),

    displaySchedule: normalizeDisplaySchedule(input.displaySchedule),
  };
}

function mergeLocalizedValue(previousValue, nextValue) {
  if (nextValue === undefined) {
    return previousValue;
  }

  return {
    en: nextValue.en === undefined ? previousValue?.en || "" : nextValue.en,

    th: nextValue.th === undefined ? previousValue?.th || "" : nextValue.th,
  };
}

function mergeAction(previousAction, nextAction) {
  if (nextAction === undefined) {
    return previousAction;
  }

  return {
    label: mergeLocalizedValue(previousAction?.label, nextAction?.label),

    href:
      nextAction?.href === undefined
        ? previousAction?.href || ""
        : nextAction.href,
  };
}

function mergeDisplaySchedule(previousSchedule, nextSchedule) {
  if (nextSchedule === undefined) {
    return previousSchedule;
  }

  return {
    startsAt:
      nextSchedule?.startsAt === undefined
        ? previousSchedule?.startsAt || null
        : nextSchedule.startsAt,

    endsAt:
      nextSchedule?.endsAt === undefined
        ? previousSchedule?.endsAt || null
        : nextSchedule.endsAt,
  };
}

function mergeHomeHeroInput(previousData, input) {
  return normalizeHomeHeroInput({
    sectionType: HOME_SECTION_TYPES.HERO_SLIDE,

    eyebrow: mergeLocalizedValue(previousData.eyebrow, input.eyebrow),

    titleLineOne: mergeLocalizedValue(
      previousData.titleLineOne,
      input.titleLineOne,
    ),

    titleLineTwo: mergeLocalizedValue(
      previousData.titleLineTwo,
      input.titleLineTwo,
    ),

    description: mergeLocalizedValue(
      previousData.description,
      input.description,
    ),

    primaryAction: mergeAction(previousData.primaryAction, input.primaryAction),

    secondaryAction: mergeAction(
      previousData.secondaryAction,
      input.secondaryAction,
    ),

    desktopImageMediaId:
      input.desktopImageMediaId === undefined
        ? previousData.desktopImageMediaId
        : input.desktopImageMediaId,

    mobileImageMediaId:
      input.mobileImageMediaId === undefined
        ? previousData.mobileImageMediaId
        : input.mobileImageMediaId,

    status: input.status === undefined ? previousData.status : input.status,

    sortOrder:
      input.sortOrder === undefined ? previousData.sortOrder : input.sortOrder,

    displaySchedule: mergeDisplaySchedule(
      previousData.displaySchedule,
      input.displaySchedule,
    ),
  });
}

function assertValidSchedule(hero) {
  const startsAt = hero.displaySchedule?.startsAt;

  const endsAt = hero.displaySchedule?.endsAt;

  if (!startsAt || !endsAt) {
    return;
  }

  if (new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
    throw new InvalidRequestError(
      "Home Hero end date must be later than start date",
      {
        field: "displaySchedule.endsAt",
      },
    );
  }
}

function assertPublishableHomeHero(hero) {
  assertValidSchedule(hero);

  if (hero.status !== HOME_SECTION_STATUSES.PUBLISHED) {
    return;
  }

  const missingFields = [];

  if (!hero.titleLineOne.en) {
    missingFields.push("titleLineOne.en");
  }

  if (!hero.titleLineOne.th) {
    missingFields.push("titleLineOne.th");
  }

  if (missingFields.length > 0) {
    throw new InvalidRequestError(
      "Published Home Hero slides require bilingual titles",
      {
        missingFields,
      },
    );
  }
}

function getHomeHeroAuditAction({ previousStatus, nextStatus }) {
  if (
    previousStatus !== HOME_SECTION_STATUSES.PUBLISHED &&
    nextStatus === HOME_SECTION_STATUSES.PUBLISHED
  ) {
    return (
      AUDIT_ACTIONS.HOME_SECTION_PUBLISH || AUDIT_ACTIONS.HOME_SECTION_UPDATE
    );
  }

  if (
    previousStatus === HOME_SECTION_STATUSES.PUBLISHED &&
    nextStatus !== HOME_SECTION_STATUSES.PUBLISHED
  ) {
    return (
      AUDIT_ACTIONS.HOME_SECTION_UNPUBLISH || AUDIT_ACTIONS.HOME_SECTION_UPDATE
    );
  }

  return AUDIT_ACTIONS.HOME_SECTION_UPDATE;
}

export async function createHomeHero({ input, actor, requestMetadata = {} }) {
  const homeSectionId = randomUUID();

  const hero = normalizeHomeHeroInput({
    ...HOME_HERO_DEFAULTS,
    ...input,
  });

  assertPublishableHomeHero(hero);

  const reference = adminDb
    .collection(COLLECTIONS.HOME_SECTIONS)
    .doc(homeSectionId);

  await adminDb.runTransaction(async (transaction) => {
    const relationships = await prepareHomeHeroRelationships({
      transaction,

      homeSectionId,

      previousData: {},

      nextData: hero,

      actor,
    });

    const writeData = {
      ...hero,

      desktopImage: relationships.desktopImage,

      mobileImage: relationships.mobileImage,

      isDeleted: false,

      deletedAt: null,

      deletedBy: null,

      createdAt: FieldValue.serverTimestamp(),

      createdBy: actor.uid,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    };

    relationships.apply();

    transaction.create(reference, writeData);

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.HOME_SECTION_CREATE,

      entityType: AUDIT_ENTITY_TYPES.HOME_SECTION,

      entityId: homeSectionId,

      before: null,

      after: writeData,

      metadata: requestMetadata,

      transaction,
    });
  });

  return getHomeHeroById(homeSectionId);
}

export async function updateHomeHero({
  heroId,
  input,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.HOME_SECTIONS).doc(heroId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (
      !snapshot.exists ||
      snapshot.data()?.isDeleted ||
      snapshot.data()?.sectionType !== HOME_SECTION_TYPES.HERO_SLIDE
    ) {
      throw new NotFoundError("Home Hero slide not found");
    }

    const before = snapshot.data();

    const hero = mergeHomeHeroInput(before, input);

    assertPublishableHomeHero(hero);

    const relationships = await prepareHomeHeroRelationships({
      transaction,

      homeSectionId: heroId,

      previousData: before,

      nextData: hero,

      actor,
    });

    const updates = {
      ...hero,

      desktopImage: relationships.desktopImage,

      mobileImage: relationships.mobileImage,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    };

    relationships.apply();

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,

      action: getHomeHeroAuditAction({
        previousStatus: before.status,

        nextStatus: hero.status,
      }),

      entityType: AUDIT_ENTITY_TYPES.HOME_SECTION,

      entityId: heroId,

      before,

      after: {
        ...before,
        ...updates,
      },

      metadata: requestMetadata,

      transaction,
    });
  });

  return getHomeHeroById(heroId);
}

export async function deleteHomeHero({ heroId, actor, requestMetadata = {} }) {
  await getHomeHeroById(heroId);

  return softDeleteEntity({
    entityType: AUDIT_ENTITY_TYPES.HOME_SECTION,

    entityId: heroId,

    actor,

    requestMetadata,
  });
}

export async function reorderHomeHeroes({
  items,
  actor,
  requestMetadata = {},
}) {
  const references = items.map((item) =>
    adminDb.collection(COLLECTIONS.HOME_SECTIONS).doc(item.heroId),
  );

  await adminDb.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(...references);

    for (const snapshot of snapshots) {
      const data = snapshot.data();

      if (
        !snapshot.exists ||
        data?.isDeleted ||
        data?.sectionType !== HOME_SECTION_TYPES.HERO_SLIDE
      ) {
        throw new NotFoundError(`Home Hero slide ${snapshot.id} not found`);
      }
    }

    const snapshotsById = new Map(
      snapshots.map((snapshot) => [snapshot.id, snapshot]),
    );

    for (const item of items) {
      const snapshot = snapshotsById.get(item.heroId);

      transaction.update(snapshot.ref, {
        sortOrder: item.sortOrder,

        updatedAt: FieldValue.serverTimestamp(),

        updatedBy: actor.uid,
      });

      await writeAuditLog({
        actor,

        action: AUDIT_ACTIONS.HOME_SECTION_UPDATE,

        entityType: AUDIT_ENTITY_TYPES.HOME_SECTION,

        entityId: item.heroId,

        before: {
          sortOrder: snapshot.data()?.sortOrder ?? null,
        },

        after: {
          sortOrder: item.sortOrder,
        },

        metadata: {
          ...requestMetadata,

          operation: "reorder",
        },

        transaction,
      });
    }
  });

  return {
    updatedCount: items.length,
  };
}
