import "server-only";

import crypto from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { USER_STATUSES } from "@/constants/admin";
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import { serverEnv } from "@/config/env.server";
import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import {
  decryptEmailSecret,
  hasEncryptedEmailSecret,
} from "@/services/email/email-crypto.service";
import { getInternalLineLoginSettings } from "@/services/site-settings/site-settings.service";

const LINE_AUTHORIZE_URL = "https://access.line.me/oauth2/v2.1/authorize";

const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";

const LINE_PROFILE_URL = "https://api.line.me/v2/profile";

const LINE_STATE_MAX_AGE_MILLISECONDS = 10 * 60 * 1000;

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

function createRequestSignature(encodedPayload) {
  return crypto
    .createHmac("sha256", serverEnv.AUTH_SECRET)
    .update(encodedPayload)
    .digest("base64url");
}

function encodeState(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  const signature = createRequestSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function decodeState(state) {
  if (typeof state !== "string" || state.length > 4000) {
    throw new InvalidRequestError("Invalid LINE connection state");
  }

  const [encodedPayload, suppliedSignature] = state.split(".");

  if (!encodedPayload || !suppliedSignature) {
    throw new InvalidRequestError("Invalid LINE connection state");
  }

  const expectedSignature = createRequestSignature(encodedPayload);

  const suppliedBuffer = Buffer.from(suppliedSignature, "utf8");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    throw new InvalidRequestError("Invalid LINE connection state");
  }

  let payload;

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    throw new InvalidRequestError("Invalid LINE connection state");
  }

  if (!payload?.userId || !payload?.nonce || !payload?.issuedAt) {
    throw new InvalidRequestError("Incomplete LINE connection state");
  }

  const issuedAt = Number(payload.issuedAt);

  if (
    !Number.isFinite(issuedAt) ||
    Date.now() - issuedAt > LINE_STATE_MAX_AGE_MILLISECONDS ||
    issuedAt > Date.now() + 60_000
  ) {
    throw new InvalidRequestError("LINE connection request has expired");
  }

  return payload;
}

function getLineCallbackUrl(requestUrl) {
  return new URL("/api/v1/users/me/line/callback", requestUrl).toString();
}

async function getLineLoginCredentials() {
  const settings = await getInternalLineLoginSettings();

  const channelId = String(settings.loginChannelId || "").trim();

  const encryptedSecret = settings.loginChannelSecretEncrypted || "";

  if (!channelId) {
    throw new InvalidRequestError("LINE Login channel ID is not configured");
  }

  if (!encryptedSecret || !hasEncryptedEmailSecret(encryptedSecret)) {
    throw new InvalidRequestError(
      "LINE Login channel secret is not configured correctly",
    );
  }

  return {
    channelId,

    channelSecret: decryptEmailSecret(encryptedSecret),
  };
}

async function exchangeAuthorizationCode({
  code,
  redirectUri,
  channelId,
  channelSecret,
}) {
  const requestBody = new URLSearchParams({
    grant_type: "authorization_code",

    code,

    redirect_uri: redirectUri,

    client_id: channelId,

    client_secret: channelSecret,
  });

  const response = await fetch(LINE_TOKEN_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: requestBody,

    cache: "no-store",

    signal: AbortSignal.timeout(15_000),
  });

  let responseData = {};

  try {
    responseData = await response.json();
  } catch {
    responseData = {};
  }

  if (!response.ok || !responseData.access_token) {
    throw new InvalidRequestError(
      responseData.error_description || "Unable to authorize LINE account",
    );
  }

  return responseData.access_token;
}

async function getLineProfile(accessToken) {
  const response = await fetch(LINE_PROFILE_URL, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },

    cache: "no-store",

    signal: AbortSignal.timeout(15_000),
  });

  let profile = {};

  try {
    profile = await response.json();
  } catch {
    profile = {};
  }

  if (!response.ok || !profile.userId) {
    throw new InvalidRequestError(
      profile.message || "Unable to retrieve LINE profile",
    );
  }

  return {
    userId: String(profile.userId).trim(),

    displayName: String(profile.displayName || "")
      .trim()
      .slice(0, 200),

    pictureUrl: String(profile.pictureUrl || "")
      .trim()
      .slice(0, 2000),
  };
}

function createPublicConnection(lineConnection) {
  if (lineConnection?.status !== "connected") {
    return {
      status: "disconnected",

      displayName: "",

      pictureUrl: "",

      connectedAt: null,

      disconnectedAt: serializeTimestamp(lineConnection?.disconnectedAt),
    };
  }

  return {
    status: "connected",

    displayName: lineConnection.displayName || "",

    pictureUrl: lineConnection.pictureUrl || "",

    connectedAt: serializeTimestamp(lineConnection.connectedAt),

    disconnectedAt: null,
  };
}

function createAuditUserSnapshot({ userId, userData }) {
  return {
    uid: userId,

    email: userData.email || "",

    displayName: userData.displayName || "",

    role: userData.role || "",

    status: userData.status || "",

    lineConnected: userData.lineConnection?.status === "connected",

    lineDisplayName: userData.lineConnection?.displayName || "",
  };
}

export async function createLineConnectRequest({ requestUrl, userId }) {
  const { channelId } = await getLineLoginCredentials();

  const redirectUri = getLineCallbackUrl(requestUrl);

  const state = encodeState({
    userId,

    nonce: crypto.randomBytes(24).toString("base64url"),

    issuedAt: Date.now(),
  });

  const authorizationUrl = new URL(LINE_AUTHORIZE_URL);

  authorizationUrl.searchParams.set("response_type", "code");

  authorizationUrl.searchParams.set("client_id", channelId);

  authorizationUrl.searchParams.set("redirect_uri", redirectUri);

  authorizationUrl.searchParams.set("state", state);

  authorizationUrl.searchParams.set("scope", "openid profile");

  authorizationUrl.searchParams.set("bot_prompt", "aggressive");

  return {
    authorizationUrl: authorizationUrl.toString(),

    state,

    expiresAt: new Date(
      Date.now() + LINE_STATE_MAX_AGE_MILLISECONDS,
    ).toISOString(),
  };
}

export function verifyLineConnectState({ state, storedState, currentUserId }) {
  if (!storedState || state !== storedState) {
    throw new InvalidRequestError("LINE connection state does not match");
  }

  const payload = decodeState(state);

  if (payload.userId !== currentUserId) {
    throw new InvalidRequestError(
      "LINE connection user does not match the signed-in account",
    );
  }

  return payload;
}

export async function getUserLineConnection(userId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .get();

  if (!snapshot.exists) {
    throw new NotFoundError("User not found");
  }

  return createPublicConnection(snapshot.data()?.lineConnection);
}

export async function connectUserLineAccount({
  requestUrl,
  code,
  state,
  storedState,
  actor,
  requestMetadata = {},
}) {
  verifyLineConnectState({
    state,

    storedState,

    currentUserId: actor.uid,
  });

  if (!code) {
    throw new InvalidRequestError("LINE authorization code is required");
  }

  const { channelId, channelSecret } = await getLineLoginCredentials();

  const redirectUri = getLineCallbackUrl(requestUrl);

  const accessToken = await exchangeAuthorizationCode({
    code,

    redirectUri,

    channelId,

    channelSecret,
  });

  const profile = await getLineProfile(accessToken);

  const userReference = adminDb.collection(COLLECTIONS.USERS).doc(actor.uid);

  await adminDb.runTransaction(async (transaction) => {
    const userSnapshot = await transaction.get(userReference);

    if (!userSnapshot.exists) {
      throw new NotFoundError("User not found");
    }

    const userData = userSnapshot.data();

    if (userData.status !== USER_STATUSES.ACTIVE) {
      throw new InvalidRequestError("Only active users can connect LINE");
    }

    const duplicateQuery = adminDb
      .collection(COLLECTIONS.USERS)
      .where("lineConnection.userId", "==", profile.userId);

    const duplicateSnapshot = await transaction.get(duplicateQuery);

    const duplicateAccount = duplicateSnapshot.docs.find(
      (document) =>
        document.id !== actor.uid &&
        document.data()?.lineConnection?.status === "connected",
    );

    if (duplicateAccount) {
      throw new ConflictError(
        "This LINE account is already connected to another user",
      );
    }

    const before = createAuditUserSnapshot({
      userId: actor.uid,
      userData,
    });

    const lineConnection = {
      status: "connected",

      userId: profile.userId,

      displayName: profile.displayName,

      pictureUrl: profile.pictureUrl,

      connectedAt: FieldValue.serverTimestamp(),

      connectedBy: actor.uid,

      disconnectedAt: null,

      disconnectedBy: null,
    };

    transaction.update(userReference, {
      lineConnection,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    });

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.USER_LINE_CONNECT,

      entityType: AUDIT_ENTITY_TYPES.USER,

      entityId: actor.uid,

      before,

      after: {
        ...before,

        lineConnected: true,

        lineDisplayName: profile.displayName,
      },

      metadata: {
        ...requestMetadata,

        targetUser: {
          uid: actor.uid,

          email: userData.email || "",

          displayName: userData.displayName || "",

          role: userData.role || "",

          status: userData.status || "",
        },
      },

      transaction,
    });
  });

  return getUserLineConnection(actor.uid);
}

export async function disconnectUserLineAccount({
  actor,
  requestMetadata = {},
}) {
  const userReference = adminDb.collection(COLLECTIONS.USERS).doc(actor.uid);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userReference);

    if (!snapshot.exists) {
      throw new NotFoundError("User not found");
    }

    const userData = snapshot.data();

    if (userData.lineConnection?.status !== "connected") {
      throw new InvalidRequestError("LINE account is not connected");
    }

    const before = createAuditUserSnapshot({
      userId: actor.uid,
      userData,
    });

    const lineConnection = {
      status: "disconnected",

      userId: null,

      displayName: "",

      pictureUrl: "",

      connectedAt: null,

      connectedBy: null,

      disconnectedAt: FieldValue.serverTimestamp(),

      disconnectedBy: actor.uid,
    };

    transaction.update(userReference, {
      lineConnection,

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    });

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.USER_LINE_DISCONNECT,

      entityType: AUDIT_ENTITY_TYPES.USER,

      entityId: actor.uid,

      before,

      after: {
        ...before,

        lineConnected: false,

        lineDisplayName: "",
      },

      metadata: {
        ...requestMetadata,

        targetUser: {
          uid: actor.uid,

          email: userData.email || "",

          displayName: userData.displayName || "",

          role: userData.role || "",

          status: userData.status || "",
        },
      },

      transaction,
    });
  });

  return getUserLineConnection(actor.uid);
}
