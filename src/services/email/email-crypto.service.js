import "server-only";

import crypto from "node:crypto";

const ENCRYPTION_VERSION = "v1";
const INITIALIZATION_VECTOR_BYTES = 12;
const AUTHENTICATION_TAG_BYTES = 16;

function getEncryptionKey() {
  const encodedKey = process.env.SMTP_SETTINGS_ENCRYPTION_KEY?.trim();

  if (!encodedKey) {
    throw new Error("SMTP_SETTINGS_ENCRYPTION_KEY is not configured");
  }

  let encryptionKey;

  try {
    encryptionKey = Buffer.from(encodedKey, "base64");
  } catch {
    throw new Error(
      "SMTP_SETTINGS_ENCRYPTION_KEY must be a valid Base64 value",
    );
  }

  if (encryptionKey.length !== 32) {
    throw new Error(
      "SMTP_SETTINGS_ENCRYPTION_KEY must decode to exactly 32 bytes",
    );
  }

  return encryptionKey;
}

export function encryptEmailSecret(value) {
  const plainText = String(value || "");

  if (!plainText) {
    return "";
  }

  const initializationVector = crypto.randomBytes(INITIALIZATION_VECTOR_BYTES);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    initializationVector,
    {
      authTagLength: AUTHENTICATION_TAG_BYTES,
    },
  );

  const encryptedValue = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authenticationTag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    initializationVector.toString("base64url"),
    authenticationTag.toString("base64url"),
    encryptedValue.toString("base64url"),
  ].join(".");
}

export function decryptEmailSecret(value) {
  const encryptedPayload = String(value || "").trim();

  if (!encryptedPayload) {
    return "";
  }

  const [
    version,
    initializationVectorValue,
    authenticationTagValue,
    encryptedValue,
  ] = encryptedPayload.split(".");

  if (
    version !== ENCRYPTION_VERSION ||
    !initializationVectorValue ||
    !authenticationTagValue ||
    !encryptedValue
  ) {
    throw new Error("Stored SMTP password has an invalid encrypted format");
  }

  try {
    const initializationVector = Buffer.from(
      initializationVectorValue,
      "base64url",
    );

    const authenticationTag = Buffer.from(authenticationTagValue, "base64url");

    const encryptedBuffer = Buffer.from(encryptedValue, "base64url");

    if (
      initializationVector.length !== INITIALIZATION_VECTOR_BYTES ||
      authenticationTag.length !== AUTHENTICATION_TAG_BYTES
    ) {
      throw new Error("Invalid encrypted payload");
    }

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      initializationVector,
      {
        authTagLength: AUTHENTICATION_TAG_BYTES,
      },
    );

    decipher.setAuthTag(authenticationTag);

    return Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]).toString("utf8");
  } catch (error) {
    throw new Error("Unable to decrypt the stored SMTP password", {
      cause: error,
    });
  }
}

export function hasEncryptedEmailSecret(value) {
  return (
    typeof value === "string" && value.startsWith(`${ENCRYPTION_VERSION}.`)
  );
}
