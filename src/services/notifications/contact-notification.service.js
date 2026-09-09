import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { adminDb } from "@/lib/firebase/admin";
import { getInternalNotificationSettings } from "@/services/site-settings/site-settings.service";
import { sendContactEmailNotification } from "@/services/email/contact-email.service";
import { sendLineNotification } from "@/services/notifications/line-notification.service";

const DELIVERY_STATUSES = Object.freeze({
  DELIVERED: "delivered",
  PARTIALLY_DELIVERED: "partially-delivered",
  FAILED: "failed",
  SKIPPED: "skipped",
});

function normalizeError(error) {
  return String(error?.message || "Unable to send notification").slice(0, 1000);
}

function createSkippedResult(reason) {
  return {
    status: DELIVERY_STATUSES.SKIPPED,
    reason,
    attemptedAt: null,
    deliveredAt: null,
    error: "",
  };
}

function createInAppResult(enabled) {
  if (!enabled) {
    return createSkippedResult("In-app notifications are disabled");
  }

  return {
    status: DELIVERY_STATUSES.DELIVERED,
    reason: "",
    attemptedAt: new Date(),
    deliveredAt: new Date(),
    error: "",
  };
}

function getEnquiryTypeLabel(value) {
  const labels = {
    product: "Product Enquiry",
    project: "Project Specification",
    technical: "Technical Support",
    partnership: "Partnership & Distribution",
    general: "General Enquiry",
  };

  return labels[value] || "General Enquiry";
}

function createLineMessage({ messageId, message }) {
  const lines = [
    "🔔 HCS Thailand — New Enquiry",
    "",
    `Name: ${message.fullName}`,
    `Company: ${message.company || "-"}`,
    `Email: ${message.email}`,
    `Phone: ${message.phone || "-"}`,
    `Type: ${getEnquiryTypeLabel(message.enquiryType)}`,
  ];

  if (message.projectName) {
    lines.push(`Project: ${message.projectName}`);
  }

  if (message.projectLocation) {
    lines.push(`Location: ${message.projectLocation}`);
  }

  lines.push("", "Message:", String(message.message || "").slice(0, 2500));

  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";

  if (configuredUrl && messageId) {
    const baseUrl =
      configuredUrl.startsWith("http://") ||
      configuredUrl.startsWith("https://")
        ? configuredUrl
        : `https://${configuredUrl}`;

    lines.push(
      "",
      `${baseUrl.replace(
        /\/+$/,
        "",
      )}/admin/messages?messageId=${encodeURIComponent(messageId)}`,
    );
  }

  return lines.join("\n");
}

async function deliverEmail({ enabled, messageId, message, settings }) {
  if (!enabled) {
    return createSkippedResult("Email notifications are disabled");
  }

  const attemptedAt = new Date();

  try {
    const result = await sendContactEmailNotification({
      messageId,
      message,
      settings,
    });

    return {
      status:
        result.rejected?.length > 0
          ? DELIVERY_STATUSES.PARTIALLY_DELIVERED
          : DELIVERY_STATUSES.DELIVERED,

      reason: "",
      attemptedAt,
      deliveredAt: new Date(),
      error: "",

      messageId: result.messageId || "",

      accepted: result.accepted || [],

      rejected: result.rejected || [],
    };
  } catch (error) {
    return {
      status: DELIVERY_STATUSES.FAILED,
      reason: "",
      attemptedAt,
      deliveredAt: null,
      error: normalizeError(error),
      messageId: "",
      accepted: [],
      rejected: [],
    };
  }
}

async function deliverLine({ enabled, messageId, message, settings }) {
  if (!enabled) {
    return createSkippedResult("LINE notifications are disabled");
  }

  const attemptedAt = new Date();

  try {
    const result = await sendLineNotification({
      settings,

      message: createLineMessage({
        messageId,
        message,
      }),
    });

    return {
      status:
        result.failedCount > 0
          ? DELIVERY_STATUSES.PARTIALLY_DELIVERED
          : DELIVERY_STATUSES.DELIVERED,

      reason: "",
      attemptedAt,
      deliveredAt: new Date(),
      error: "",

      sentCount: result.sentCount || 0,

      failedCount: result.failedCount || 0,

      results: result.results || [],
    };
  } catch (error) {
    return {
      status: DELIVERY_STATUSES.FAILED,
      reason: "",
      attemptedAt,
      deliveredAt: null,
      error: normalizeError(error),
      sentCount: 0,
      failedCount: 0,
      results: [],
    };
  }
}

function serializeDeliveryResult(result) {
  return {
    ...result,

    attemptedAt: result.attemptedAt ? FieldValue.serverTimestamp() : null,

    deliveredAt: result.deliveredAt ? FieldValue.serverTimestamp() : null,
  };
}

export async function dispatchContactNotifications({ messageId, message }) {
  const messageReference = adminDb
    .collection(COLLECTIONS.CONTACT_MESSAGES)
    .doc(messageId);

  let settings;

  try {
    settings = await getInternalNotificationSettings();
  } catch (error) {
    const configurationError = normalizeError(error);

    const failedDelivery = {
      inApp: {
        status: DELIVERY_STATUSES.DELIVERED,
        reason: "",
        attemptedAt: FieldValue.serverTimestamp(),
        deliveredAt: FieldValue.serverTimestamp(),
        error: "",
      },

      email: {
        status: DELIVERY_STATUSES.FAILED,
        reason: "",
        attemptedAt: FieldValue.serverTimestamp(),
        deliveredAt: null,
        error: configurationError,
      },

      line: {
        status: DELIVERY_STATUSES.FAILED,
        reason: "",
        attemptedAt: FieldValue.serverTimestamp(),
        deliveredAt: null,
        error: configurationError,
      },

      processedAt: FieldValue.serverTimestamp(),
    };

    await messageReference.set(
      {
        notificationDelivery: failedDelivery,
      },
      {
        merge: true,
      },
    );

    return failedDelivery;
  }

  const channels = settings.channels || {};

  const inAppResult = createInAppResult(channels.inApp);

  const [emailResult, lineResult] = await Promise.all([
    deliverEmail({
      enabled: Boolean(channels.email),

      messageId,
      message,

      settings: settings.email,
    }),

    deliverLine({
      enabled: Boolean(channels.line),

      messageId,
      message,

      settings: settings.line,
    }),
  ]);

  const delivery = {
    inApp: serializeDeliveryResult(inAppResult),

    email: serializeDeliveryResult(emailResult),

    line: serializeDeliveryResult(lineResult),

    processedAt: FieldValue.serverTimestamp(),
  };

  try {
    await messageReference.set(
      {
        notificationDelivery: delivery,
      },
      {
        merge: true,
      },
    );
  } catch (error) {
    console.error("Unable to record contact notification delivery:", error);
  }

  return delivery;
}
