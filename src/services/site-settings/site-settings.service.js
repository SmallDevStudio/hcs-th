import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { USER_STATUSES } from "@/constants/admin";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import { InvalidRequestError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { DEFAULT_SITE_SETTINGS } from "@/modules/site-settings/site-settings.defaults";
import { writeAuditLog } from "@/services/audit/audit.service";
import { encryptEmailSecret } from "@/services/email/email-crypto.service";

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

    notifications: {
      ...defaults.notifications,
      ...(stored.notifications || {}),

      channels: {
        ...defaults.notifications.channels,
        ...(stored.notifications?.channels || {}),
      },

      email: {
        ...defaults.notifications.email,
        ...(stored.notifications?.email || {}),

        recipients: Array.isArray(stored.notifications?.email?.recipients)
          ? stored.notifications.email.recipients
          : defaults.notifications.email.recipients,
      },

      line: {
        ...defaults.notifications.line,
        ...(stored.notifications?.line || {}),

        /*
         * ไม่ migrate targetIds เดิม เพราะเป็น LINE User/Group ID
         * ที่กรอกเองและไม่สามารถยืนยันตัวตนกับ User ในระบบได้
         */
        recipientUserIds: Array.isArray(
          stored.notifications?.line?.recipientUserIds,
        )
          ? stored.notifications.line.recipientUserIds
          : defaults.notifications.line.recipientUserIds,
      },
    },
  };
}

function normalizeKeywords(keywords = []) {
  return [
    ...new Set(
      keywords.map((keyword) => String(keyword || "").trim()).filter(Boolean),
    ),
  ];
}

function normalizeEmailList(values = []) {
  return [
    ...new Set(
      values
        .map((value) =>
          String(value || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    ),
  ];
}

function normalizeIdList(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
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

  normalized.notifications.email.recipients = normalizeEmailList(
    normalized.notifications.email.recipients,
  );

  normalized.notifications.line.recipientUserIds = normalizeIdList(
    normalized.notifications.line.recipientUserIds,
  );

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

function sanitizeNotificationSettings(notifications = {}) {
  const email = notifications.email || {};

  const line = notifications.line || {};

  return {
    channels: {
      inApp: Boolean(notifications.channels?.inApp),

      email: Boolean(notifications.channels?.email),

      line: Boolean(notifications.channels?.line),
    },

    email: {
      smtpHost: email.smtpHost || "",

      smtpPort: Number(email.smtpPort || 587),

      smtpSecure: Boolean(email.smtpSecure),

      smtpUsername: email.smtpUsername || "",

      smtpPassword: "",

      passwordConfigured: Boolean(email.smtpPasswordEncrypted),

      fromName: email.fromName || "HCS Thailand Website",

      fromEmail: email.fromEmail || "",

      recipients: Array.isArray(email.recipients) ? email.recipients : [],
    },

    line: {
      channelAccessToken: "",

      tokenConfigured: Boolean(line.channelAccessTokenEncrypted),

      loginChannelId: line.loginChannelId || "",

      loginChannelSecret: "",

      loginSecretConfigured: Boolean(line.loginChannelSecretEncrypted),

      recipientUserIds: Array.isArray(line.recipientUserIds)
        ? line.recipientUserIds
        : [],
    },
  };
}

function sanitizeSettings(settings) {
  return {
    company: settings.company,

    contact: settings.contact,

    social: settings.social,

    branding: settings.branding,

    seo: settings.seo,

    integrations: settings.integrations,

    notifications: sanitizeNotificationSettings(settings.notifications),
  };
}

function createNotificationWriteData({ notifications, existingNotifications }) {
  const currentEmail = existingNotifications?.email || {};

  const currentLine = existingNotifications?.line || {};

  const submittedSmtpPassword = notifications.email.smtpPassword || "";

  const submittedLineToken = notifications.line.channelAccessToken || "";

  const submittedLineLoginSecret = notifications.line.loginChannelSecret || "";

  const smtpPasswordEncrypted = submittedSmtpPassword
    ? encryptEmailSecret(submittedSmtpPassword)
    : currentEmail.smtpPasswordEncrypted || "";

  const channelAccessTokenEncrypted = submittedLineToken
    ? encryptEmailSecret(submittedLineToken)
    : currentLine.channelAccessTokenEncrypted || "";

  const loginChannelSecretEncrypted = submittedLineLoginSecret
    ? encryptEmailSecret(submittedLineLoginSecret)
    : currentLine.loginChannelSecretEncrypted || "";

  if (notifications.channels.email && !smtpPasswordEncrypted) {
    throw new InvalidRequestError(
      "SMTP password is required before enabling email notifications",
    );
  }

  if (notifications.channels.line && !channelAccessTokenEncrypted) {
    throw new InvalidRequestError(
      "LINE channel access token is required before enabling LINE notifications",
    );
  }

  const loginChannelId = notifications.line.loginChannelId || "";

  if (loginChannelId && !loginChannelSecretEncrypted) {
    throw new InvalidRequestError(
      "LINE Login channel secret is required when a channel ID is configured",
    );
  }

  if (!loginChannelId && loginChannelSecretEncrypted) {
    throw new InvalidRequestError(
      "LINE Login channel ID is required when a channel secret is configured",
    );
  }

  return {
    channels: {
      inApp: Boolean(notifications.channels.inApp),

      email: Boolean(notifications.channels.email),

      line: Boolean(notifications.channels.line),
    },

    email: {
      smtpHost: notifications.email.smtpHost,

      smtpPort: Number(notifications.email.smtpPort),

      smtpSecure: Boolean(notifications.email.smtpSecure),

      smtpUsername: notifications.email.smtpUsername,

      smtpPasswordEncrypted,

      fromName: notifications.email.fromName,

      fromEmail: notifications.email.fromEmail,

      recipients: normalizeEmailList(notifications.email.recipients),
    },

    line: {
      channelAccessTokenEncrypted,

      loginChannelId,

      loginChannelSecretEncrypted,

      recipientUserIds: normalizeIdList(notifications.line.recipientUserIds),
    },
  };
}

function createSettingsResponse({ id, settings, metadata = {} }) {
  return {
    id,

    ...sanitizeSettings(settings),

    createdAt: serializeTimestamp(metadata.createdAt),

    updatedAt: serializeTimestamp(metadata.updatedAt),

    updatedBy: metadata.updatedBy || null,
  };
}

async function getSiteSettingsSnapshot() {
  const reference = adminDb
    .collection(COLLECTIONS.SITE_SETTINGS)
    .doc(SITE_SETTINGS_DOCUMENT_ID);

  const snapshot = await reference.get();

  if (!snapshot.exists) {
    return {
      reference,

      snapshot,

      data: null,

      settings: mergeSiteSettings(DEFAULT_SITE_SETTINGS, {}),
    };
  }

  const data = snapshot.data();

  return {
    reference,

    snapshot,

    data,

    settings: mergeSiteSettings(DEFAULT_SITE_SETTINGS, data),
  };
}

function isConnectedLineUser(userData) {
  return (
    userData?.status === USER_STATUSES.ACTIVE &&
    userData?.lineConnection?.status === "connected" &&
    Boolean(String(userData?.lineConnection?.userId || "").trim())
  );
}

async function validateLineRecipientUsers({ transaction, userIds }) {
  const normalizedUserIds = normalizeIdList(userIds);

  if (!normalizedUserIds.length) {
    return [];
  }

  const references = normalizedUserIds.map((userId) =>
    adminDb.collection(COLLECTIONS.USERS).doc(userId),
  );

  const snapshots = await transaction.getAll(...references);

  const snapshotsById = new Map(
    snapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  return normalizedUserIds.filter((userId) => {
    const snapshot = snapshotsById.get(userId);

    return snapshot?.exists && isConnectedLineUser(snapshot.data());
  });
}

export async function getSiteSettings() {
  const { snapshot, data, settings } = await getSiteSettingsSnapshot();

  return createSettingsResponse({
    id: snapshot.exists ? snapshot.id : SITE_SETTINGS_DOCUMENT_ID,

    settings,

    metadata: data || {},
  });
}

export async function getInternalNotificationSettings() {
  const { settings } = await getSiteSettingsSnapshot();

  return {
    ...settings.notifications,

    email: {
      ...settings.notifications.email,

      smtpPassword: undefined,

      passwordConfigured: undefined,
    },

    line: {
      ...settings.notifications.line,

      channelAccessToken: undefined,

      tokenConfigured: undefined,

      loginChannelSecret: undefined,

      loginSecretConfigured: undefined,
    },
  };
}

export async function getInternalLineLoginSettings() {
  const { settings } = await getSiteSettingsSnapshot();

  const line = settings.notifications?.line || {};

  return {
    loginChannelId: line.loginChannelId || "",

    loginChannelSecretEncrypted: line.loginChannelSecretEncrypted || "",
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

    const existingSettings = mergeSiteSettings(
      DEFAULT_SITE_SETTINGS,
      existingData || {},
    );

    const notificationWriteData = createNotificationWriteData({
      notifications: normalizedSettings.notifications,

      existingNotifications: existingData?.notifications || {},
    });

    const validatedRecipientUserIds = await validateLineRecipientUsers({
      transaction,

      userIds: notificationWriteData.line.recipientUserIds,
    });

    if (
      notificationWriteData.channels.line &&
      !validatedRecipientUserIds.length
    ) {
      throw new InvalidRequestError(
        "At least one active user connected to LINE is required before enabling LINE notifications",
        {
          field: "notifications.line.recipientUserIds",
        },
      );
    }

    notificationWriteData.line.recipientUserIds = validatedRecipientUserIds;

    const writeData = {
      company: normalizedSettings.company,

      contact: normalizedSettings.contact,

      social: normalizedSettings.social,

      branding: normalizedSettings.branding,

      seo: normalizedSettings.seo,

      integrations: normalizedSettings.integrations,

      notifications: notificationWriteData,

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

      action: snapshot.exists
        ? AUDIT_ACTIONS.SITE_SETTINGS_UPDATE
        : AUDIT_ACTIONS.SITE_SETTINGS_CREATE,

      entityType: AUDIT_ENTITY_TYPES.SITE_SETTINGS,

      entityId: SITE_SETTINGS_DOCUMENT_ID,

      before: sanitizeSettings(existingSettings),

      after: sanitizeSettings({
        ...normalizedSettings,

        notifications: notificationWriteData,
      }),

      metadata: requestMetadata,

      transaction,
    });
  });

  return getSiteSettings();
}
