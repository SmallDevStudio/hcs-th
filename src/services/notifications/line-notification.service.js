import "server-only";

import {
  decryptEmailSecret,
  hasEncryptedEmailSecret,
} from "@/services/email/email-crypto.service";

const LINE_PUSH_MESSAGE_URL = "https://api.line.me/v2/bot/message/push";

const LINE_MESSAGE_MAX_LENGTH = 5000;

function normalizeTargetIds(values = []) {
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

async function pushLineMessage({ channelAccessToken, targetId, message }) {
  const response = await fetch(LINE_PUSH_MESSAGE_URL, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${channelAccessToken}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      to: targetId,

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

  return {
    targetId,
    success: true,
  };
}

export async function sendLineNotification({ settings, message }) {
  const targetIds = normalizeTargetIds(settings?.targetIds);

  if (!targetIds.length) {
    throw new Error("At least one LINE notification target is required");
  }

  const channelAccessToken = getChannelAccessToken(settings);

  const normalizedMessage = normalizeMessage(message);

  const settledResults = await Promise.allSettled(
    targetIds.map((targetId) =>
      pushLineMessage({
        channelAccessToken,
        targetId,
        message: normalizedMessage,
      }),
    ),
  );

  const results = settledResults.map((result, index) => {
    const targetId = targetIds[index];

    if (result.status === "fulfilled") {
      return result.value;
    }

    return {
      targetId,
      success: false,
      error: result.reason?.message || "Unable to send LINE notification",
    };
  });

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
