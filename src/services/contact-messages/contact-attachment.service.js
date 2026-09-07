import "server-only";

import crypto from "node:crypto";

import { randomUUID } from "node:crypto";

import { InvalidRequestError } from "@/lib/api/errors";
import { adminBucket } from "@/lib/firebase/admin";

const CONTACT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

const CONTACT_ATTACHMENT_EXPIRATION_MINUTES = 15;

const CONTACT_ATTACHMENT_ROOT = "contact-attachments";

const CONTACT_ATTACHMENT_MIME_TYPES = Object.freeze({
  "application/pdf": "pdf",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
});

function getSigningSecret() {
  const secret = process.env.AUTH_SECRET || process.env.REVALIDATE_SECRET;

  if (!secret) {
    throw new Error("Contact attachment signing secret is not configured");
  }

  return secret;
}

function sanitizeOriginalName(fileName) {
  return String(fileName || "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function createSignature(encodedPayload) {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function encodeUploadToken(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  const signature = createSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function decodeUploadToken(token) {
  if (typeof token !== "string" || token.length > 4000) {
    throw new InvalidRequestError("Invalid contact attachment token");
  }

  const [encodedPayload, suppliedSignature] = token.split(".");

  if (!encodedPayload || !suppliedSignature) {
    throw new InvalidRequestError("Invalid contact attachment token");
  }

  const expectedSignature = createSignature(encodedPayload);

  const suppliedBuffer = Buffer.from(suppliedSignature, "utf8");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    throw new InvalidRequestError("Invalid contact attachment token");
  }

  let payload;

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    throw new InvalidRequestError("Invalid contact attachment token");
  }

  if (
    !payload?.storagePath ||
    !payload?.mimeType ||
    !payload?.size ||
    !payload?.expiresAt ||
    !payload?.originalName
  ) {
    throw new InvalidRequestError("Incomplete contact attachment token");
  }

  if (Number(payload.expiresAt) < Date.now()) {
    throw new InvalidRequestError("Contact attachment upload has expired");
  }

  if (!payload.storagePath.startsWith(`${CONTACT_ATTACHMENT_ROOT}/`)) {
    throw new InvalidRequestError("Invalid contact attachment path");
  }

  return payload;
}

function createStoragePath(extension) {
  const now = new Date();

  const year = String(now.getUTCFullYear());

  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return [
    CONTACT_ATTACHMENT_ROOT,
    year,
    month,
    `${randomUUID()}.${extension}`,
  ].join("/");
}

export function validateContactAttachmentRequest({
  originalName,
  mimeType,
  size,
}) {
  const sanitizedName = sanitizeOriginalName(originalName);

  const extension = CONTACT_ATTACHMENT_MIME_TYPES[mimeType];

  const normalizedSize = Number(size);

  if (!sanitizedName) {
    throw new InvalidRequestError("A valid attachment file name is required");
  }

  if (!extension) {
    throw new InvalidRequestError("Only PDF and DOCX files are supported");
  }

  if (
    !Number.isInteger(normalizedSize) ||
    normalizedSize <= 0 ||
    normalizedSize > CONTACT_ATTACHMENT_MAX_BYTES
  ) {
    throw new InvalidRequestError("Attachment must not exceed 10 MB");
  }

  return {
    originalName: sanitizedName,
    mimeType,
    size: normalizedSize,
    extension,
  };
}

export async function createContactAttachmentUpload({
  originalName,
  mimeType,
  size,
}) {
  const validated = validateContactAttachmentRequest({
    originalName,
    mimeType,
    size,
  });

  const storagePath = createStoragePath(validated.extension);

  const expiresAt =
    Date.now() + CONTACT_ATTACHMENT_EXPIRATION_MINUTES * 60 * 1000;

  const file = adminBucket.file(storagePath);

  const [signedUploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: new Date(expiresAt),
    contentType: validated.mimeType,
  });

  const uploadToken = encodeUploadToken({
    storagePath,
    originalName: validated.originalName,
    mimeType: validated.mimeType,
    size: validated.size,
    expiresAt,
  });

  return {
    signedUploadUrl,
    uploadToken,
    expiresAt: new Date(expiresAt).toISOString(),

    requiredHeaders: {
      "Content-Type": validated.mimeType,
    },
  };
}

export async function verifyContactAttachment(uploadToken) {
  if (!uploadToken) {
    return null;
  }

  const payload = decodeUploadToken(uploadToken);

  const file = adminBucket.file(payload.storagePath);

  const [exists] = await file.exists();

  if (!exists) {
    throw new InvalidRequestError("Uploaded contact attachment was not found");
  }

  const [metadata] = await file.getMetadata();

  const actualMimeType = metadata.contentType || "";

  const actualSize = Number(metadata.size || 0);

  if (
    actualMimeType !== payload.mimeType ||
    actualSize !== Number(payload.size) ||
    actualSize <= 0 ||
    actualSize > CONTACT_ATTACHMENT_MAX_BYTES
  ) {
    await file.delete({
      ignoreNotFound: true,
    });

    throw new InvalidRequestError(
      "Uploaded contact attachment does not match its reservation",
    );
  }

  await file.setMetadata({
    contentType: payload.mimeType,

    cacheControl: "private, no-store",

    contentDisposition: `attachment; filename="${payload.originalName.replace(
      /["\r\n]/g,
      "",
    )}"`,

    metadata: {
      contactAttachment: "true",
    },
  });

  return {
    originalName: payload.originalName,
    storagePath: payload.storagePath,
    mimeType: payload.mimeType,
    size: actualSize,
  };
}
