import "server-only";

import { USER_STATUSES } from "@/constants/admin";
import { COLLECTIONS } from "@/constants/collections";
import { adminDb } from "@/lib/firebase/admin";
import {
  decryptEmailSecret,
  hasEncryptedEmailSecret,
} from "@/services/email/email-crypto.service";

const LINE_PUSH_MESSAGE_URL = "https://api.line.me/v2/bot/message/push";

const LINE_MESSAGE_MAX_LENGTH = 5000;

function normalizeUserIds(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  ];
}

function getChannelAccessToken(settings) {
  const encryptedToken = settings?.channelAccessTokenEncrypted || "";

  if (!encryptedToken) {
    throw new Error("LINE channel access token is not configured");
  }

  if (!hasEncryptedEmailSecret(encryptedToken)) {
    throw new Error("LINE channel access token is not encrypted correctly");
  }

  return decryptEmailSecret(encryptedToken);
}

function normalizeMessage(message) {
  const normalizedMessage = String(message || "").trim();

  if (!normalizedMessage) {
    throw new Error("LINE notification message is required");
  }

  return normalizedMessage.slice(0, LINE_MESSAGE_MAX_LENGTH);
}

function isConnectedLineUser(userData) {
  return (
    userData?.status === USER_STATUSES.ACTIVE &&
    userData?.lineConnection?.status === "connected" &&
    Boolean(String(userData?.lineConnection?.userId || "").trim())
  );
}

function createRecipient({ userId, userData }) {
  return {
    userId,

    displayName: userData.displayName || userData.email || "User",

    email: userData.email || "",

    lineUserId: userData.lineConnection.userId,
  };
}

async function resolveLineRecipients(recipientUserIds) {
  const userIds = normalizeUserIds(recipientUserIds);

  if (!userIds.length) {
    throw new Error("At least one LINE notification recipient is required");
  }

  const references = userIds.map((userId) =>
    adminDb.collection(COLLECTIONS.USERS).doc(userId),
  );

  const snapshots = await adminDb.getAll(...references);

  const snapshotsById = new Map(
    snapshots.map((snapshot) => [snapshot.id, snapshot]),
  );

  const recipients = [];

  const unavailableRecipients = [];

  for (const userId of userIds) {
    const snapshot = snapshotsById.get(userId);

    if (!snapshot?.exists) {
      unavailableRecipients.push({
        userId,

        displayName: "",

        success: false,

        error: "User account was not found",
      });

      continue;
    }

    const userData = snapshot.data();

    if (!isConnectedLineUser(userData)) {
      unavailableRecipients.push({
        userId,

        displayName: userData.displayName || userData.email || "",

        success: false,

        error:
          userData.status !== USER_STATUSES.ACTIVE
            ? "User account is inactive"
            : "User is not connected to LINE",
      });

      continue;
    }

    recipients.push(
      createRecipient({
        userId,

        userData,
      }),
    );
  }

  return {
    recipients,

    unavailableRecipients,
  };
}

async function pushLineMessage({ channelAccessToken, lineUserId, message }) {
  const response = await fetch(LINE_PUSH_MESSAGE_URL, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${channelAccessToken}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      to: lineUserId,

      messages: [
        {
          type: "text",

          text: message,
        },
      ],
    }),

    cache: "no-store",

    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    let responseMessage = "";

    try {
      const responseData = await response.json();

      responseMessage = responseData?.message || "";
    } catch {
      responseMessage = await response.text();
    }

    throw new Error(
      responseMessage || `LINE Messaging API returned HTTP ${response.status}`,
    );
  }
}

export async function sendLineNotification({ settings, message }) {
  const channelAccessToken = getChannelAccessToken(settings);

  const normalizedMessage = normalizeMessage(message);

  const { recipients, unavailableRecipients } = await resolveLineRecipients(
    settings?.recipientUserIds,
  );

  if (!recipients.length) {
    throw new Error(
      unavailableRecipients[0]?.error ||
        "No active users are connected to LINE",
    );
  }

  const settledResults = await Promise.allSettled(
    recipients.map((recipient) =>
      pushLineMessage({
        channelAccessToken,

        lineUserId: recipient.lineUserId,

        message: normalizedMessage,
      }),
    ),
  );

  const deliveryResults = settledResults.map((result, index) => {
    const recipient = recipients[index];

    if (result.status === "fulfilled") {
      return {
        userId: recipient.userId,

        displayName: recipient.displayName,

        success: true,

        error: "",
      };
    }

    return {
      userId: recipient.userId,

      displayName: recipient.displayName,

      success: false,

      error: result.reason?.message || "Unable to send LINE notification",
    };
  });

  const results = [...deliveryResults, ...unavailableRecipients];

  const successfulResults = results.filter((result) => result.success);

  const failedResults = results.filter((result) => !result.success);

  if (!successfulResults.length) {
    throw new Error(
      failedResults[0]?.error || "Unable to send LINE notification",
    );
  }

  return {
    success: failedResults.length === 0,

    sentCount: successfulResults.length,

    failedCount: failedResults.length,

    results,
  };
}

export async function sendLineTestNotification({ settings }) {
  const testedAt = new Date().toISOString();

  return sendLineNotification({
    settings,

    message: [
      "HCS Thailand",

      "LINE notification configuration is working correctly.",

      `Tested at: ${testedAt}`,
    ].join("\n"),
  });
}
