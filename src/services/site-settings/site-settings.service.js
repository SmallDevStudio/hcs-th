import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { adminDb } from "@/lib/firebase/admin";
import { DEFAULT_SITE_SETTINGS } from "@/modules/site-settings/site-settings.defaults";
import { writeAuditLog } from "@/services/audit/audit.service";

const SITE_SETTINGS_DOCUMENT_ID = "global";

function mergeLocalizedValue(defaultValue, storedValue) {
  return {
    ...defaultValue,
    ...(storedValue || {}),
  };
}

function mergeSiteSettings(defaults, stored = {}) {
  return {
    company: {
      ...defaults.company,
      ...(stored.company || {}),

      displayName: mergeLocalizedValue(
        defaults.company.displayName,
        stored.company?.displayName,
      ),

      legalName: mergeLocalizedValue(
        defaults.company.legalName,
        stored.company?.legalName,
      ),

      tagline: mergeLocalizedValue(
        defaults.company.tagline,
        stored.company?.tagline,
      ),

      description: mergeLocalizedValue(
        defaults.company.description,
        stored.company?.description,
      ),
    },

    contact: {
      ...defaults.contact,
      ...(stored.contact || {}),

      address: mergeLocalizedValue(
        defaults.contact.address,
        stored.contact?.address,
      ),

      businessHours: mergeLocalizedValue(
        defaults.contact.businessHours,
        stored.contact?.businessHours,
      ),
    },

    social: {
      ...defaults.social,
      ...(stored.social || {}),
    },

    branding: {
      ...defaults.branding,
      ...(stored.branding || {}),
    },

    seo: {
      ...defaults.seo,
      ...(stored.seo || {}),

      en: {
        ...defaults.seo.en,
        ...(stored.seo?.en || {}),
      },

      th: {
        ...defaults.seo.th,
        ...(stored.seo?.th || {}),
      },
    },

    integrations: {
      ...defaults.integrations,
      ...(stored.integrations || {}),
    },
  };
}

function normalizeKeywords(keywords = []) {
  return [
    ...new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean)),
  ];
}

function createSeoFallback(settings, locale) {
  const companyName =
    settings.company.displayName[locale] ||
    settings.company.displayName.en ||
    "HCS Thailand";

  const tagline =
    settings.company.tagline[locale] || settings.company.tagline.en || "";

  const description =
    settings.company.description[locale] ||
    settings.company.description.en ||
    "";

  return {
    title: [companyName, tagline].filter(Boolean).join(" | ").slice(0, 70),
    description: description.slice(0, 180),
  };
}

function normalizeSettings(settings) {
  const normalized = structuredClone(settings);

  for (const locale of ["en", "th"]) {
    const fallback = createSeoFallback(normalized, locale);

    normalized.seo[locale].title =
      normalized.seo[locale].title.trim() || fallback.title;

    normalized.seo[locale].description =
      normalized.seo[locale].description.trim() || fallback.description;

    normalized.seo[locale].keywords = normalizeKeywords(
      normalized.seo[locale].keywords,
    );
  }

  return normalized;
}

function serializeTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

export async function getSiteSettings() {
  const reference = adminDb
    .collection(COLLECTIONS.SITE_SETTINGS)
    .doc(SITE_SETTINGS_DOCUMENT_ID);

  const snapshot = await reference.get();

  if (!snapshot.exists) {
    return {
      id: SITE_SETTINGS_DOCUMENT_ID,
      ...structuredClone(DEFAULT_SITE_SETTINGS),
      createdAt: null,
      updatedAt: null,
      updatedBy: null,
    };
  }

  const data = snapshot.data();
  const mergedSettings = mergeSiteSettings(DEFAULT_SITE_SETTINGS, data);

  return {
    id: snapshot.id,
    ...mergedSettings,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    updatedBy: data.updatedBy || null,
  };
}

export async function updateSiteSettings({
  settings,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb
    .collection(COLLECTIONS.SITE_SETTINGS)
    .doc(SITE_SETTINGS_DOCUMENT_ID);

  const normalizedSettings = normalizeSettings(settings);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existingData = snapshot.exists ? snapshot.data() : null;

    const before = existingData
      ? mergeSiteSettings(DEFAULT_SITE_SETTINGS, existingData)
      : structuredClone(DEFAULT_SITE_SETTINGS);

    const writeData = {
      ...normalizedSettings,

      createdAt: existingData?.createdAt || FieldValue.serverTimestamp(),

      createdBy: existingData?.createdBy || actor.uid,

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    transaction.set(reference, writeData, {
      merge: false,
    });

    await writeAuditLog({
      actor,
      action: snapshot.exists ? "SITE_SETTINGS_UPDATE" : "SITE_SETTINGS_CREATE",
      entityType: "siteSettings",
      entityId: SITE_SETTINGS_DOCUMENT_ID,
      before,
      after: normalizedSettings,
      metadata: requestMetadata,
      transaction,
    });
  });

  return getSiteSettings();
}
