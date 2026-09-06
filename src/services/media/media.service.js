import "server-only";

import { randomUUID } from "node:crypto";

import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import {
  MEDIA_LIMITS,
  MEDIA_STATUSES,
  MEDIA_STORAGE_ROOT,
  MEDIA_TYPES,
  getMediaExtension,
  getMediaTypeFromMimeType,
} from "@/constants/media";
import {
  ConflictError,
  InvalidRequestError,
  NotFoundError,
} from "@/lib/api/errors";
import { adminBucket, adminDb } from "@/lib/firebase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import { softDeleteEntity } from "@/services/trash/trash.service";

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

function serializeMediaAsset(document) {
  const data = document.data();

  return {
    id: document.id,

    type: data.type,
    status: data.status,
    folder: data.folder,

    originalName: data.originalName,
    storagePath: data.storagePath,
    publicUrl: data.publicUrl || null,

    mimeType: data.mimeType,
    extension: data.extension,
    size: data.size,

    width: data.width || null,
    height: data.height || null,

    title: {
      en: data.title?.en || "",
      th: data.title?.th || "",
    },

    altText: {
      en: data.altText?.en || "",
      th: data.altText?.th || "",
    },

    caption: {
      en: data.caption?.en || "",
      th: data.caption?.th || "",
    },

    keywords: Array.isArray(data.keywords) ? data.keywords : [],

    isUsed: Boolean(data.isUsed),
    usageCount: Number(data.usageCount || 0),
    usedBy: Array.isArray(data.usedBy) ? data.usedBy : [],

    usageCount: Number(data.usageCount || 0),
    usedBy: Array.isArray(data.usedBy) ? data.usedBy : [],

    checksum: data.checksum || null,

    isDeleted: Boolean(data.isDeleted),

    createdAt: serializeTimestamp(data.createdAt),
    createdBy: data.createdBy || null,

    updatedAt: serializeTimestamp(data.updatedAt),
    updatedBy: data.updatedBy || null,

    uploadedAt: serializeTimestamp(data.uploadedAt),
    uploadExpiresAt: serializeTimestamp(data.uploadExpiresAt),
  };
}

function sanitizeOriginalName(fileName) {
  return fileName
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MEDIA_LIMITS.ORIGINAL_NAME_MAX_LENGTH);
}

function normalizeLocalizedValue(value = {}) {
  return {
    en: value.en?.trim() || "",
    th: value.th?.trim() || "",
  };
}

function normalizeKeywords(keywords = []) {
  return [
    ...new Set(
      keywords
        .map((keyword) => keyword.trim().toLocaleLowerCase())
        .filter(Boolean),
    ),
  ];
}

function createSearchTokens({ originalName, title, altText, keywords }) {
  const values = [
    originalName,
    title.en,
    title.th,
    altText.en,
    altText.th,
    ...keywords,
  ];

  const tokens = values.flatMap((value) =>
    String(value || "")
      .toLocaleLowerCase()
      .split(/[\s,._\-()[\]{}]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2)
      .slice(0, 30),
  );

  return [...new Set(tokens)].slice(0, 100);
}

function createStoragePath({ mediaId, mediaType, folder, extension }) {
  const now = new Date();

  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  const group = mediaType === MEDIA_TYPES.IMAGE ? "images" : "documents";

  return [
    MEDIA_STORAGE_ROOT,
    group,
    folder,
    year,
    month,
    `${mediaId}.${extension}`,
  ].join("/");
}

function createUploadExpiration() {
  return Timestamp.fromMillis(
    Date.now() + MEDIA_LIMITS.SIGNED_UPLOAD_EXPIRES_MINUTES * 60 * 1000,
  );
}

function createDownloadUrl({ bucketName, storagePath, downloadToken }) {
  return [
    `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/`,
    encodeURIComponent(storagePath),
    `?alt=media&token=${downloadToken}`,
  ].join("");
}

function encodeCursor({ createdAt, documentId }) {
  return Buffer.from(
    JSON.stringify({
      createdAt,
      documentId,
    }),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (
      typeof decoded.createdAt !== "string" ||
      typeof decoded.documentId !== "string" ||
      !decoded.documentId ||
      Number.isNaN(new Date(decoded.createdAt).getTime())
    ) {
      throw new Error("Invalid cursor");
    }

    return decoded;
  } catch {
    throw new InvalidRequestError("Invalid media cursor");
  }
}

async function markUploadAsFailed({ reference, reason }) {
  await reference.set(
    {
      status: MEDIA_STATUSES.FAILED,
      failureReason: reason,
      updatedAt: FieldValue.serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

export async function createMediaUploadReservation({ input, actor }) {
  const mediaType = getMediaTypeFromMimeType(input.mimeType);
  const extension = getMediaExtension(input.mimeType);

  if (!mediaType || !extension) {
    throw new InvalidRequestError("Unsupported media file type");
  }

  const mediaId = randomUUID();

  const originalName = sanitizeOriginalName(input.originalName);

  if (!originalName) {
    throw new InvalidRequestError("Invalid original file name");
  }

  const title = normalizeLocalizedValue(input.title);
  const altText = normalizeLocalizedValue(input.altText);
  const caption = normalizeLocalizedValue(input.caption);
  const keywords = normalizeKeywords(input.keywords);

  const storagePath = createStoragePath({
    mediaId,
    mediaType,
    folder: input.folder,
    extension,
  });

  const reference = adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId);

  const uploadExpiresAt = createUploadExpiration();

  const reservationData = {
    type: mediaType,
    status: MEDIA_STATUSES.UPLOADING,
    folder: input.folder,

    originalName,
    storagePath,
    publicUrl: null,

    mimeType: input.mimeType,
    extension,
    size: input.size,

    width: null,
    height: null,

    title,
    altText,
    caption,
    keywords,

    searchTokens: createSearchTokens({
      originalName,
      title,
      altText,
      keywords,
    }),

    isUsed: false,
    usageCount: 0,
    usedBy: [],

    usageCount: 0,
    usedBy: [],

    checksum: null,
    downloadToken: null,

    isDeleted: false,
    deletedAt: null,
    deletedBy: null,

    uploadExpiresAt,

    createdAt: FieldValue.serverTimestamp(),
    createdBy: actor.uid,

    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: actor.uid,

    uploadedAt: null,
  };

  await reference.create(reservationData);

  try {
    const file = adminBucket.file(storagePath);

    const [signedUploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: uploadExpiresAt.toDate(),
      contentType: input.mimeType,
    });

    return {
      mediaId,
      storagePath,
      signedUploadUrl,

      expiresAt: uploadExpiresAt.toDate().toISOString(),

      requiredHeaders: {
        "Content-Type": input.mimeType,
      },

      asset: {
        id: mediaId,
        type: mediaType,
        status: MEDIA_STATUSES.UPLOADING,
        folder: input.folder,
        originalName,
        mimeType: input.mimeType,
        extension,
        size: input.size,
      },
    };
  } catch (error) {
    await markUploadAsFailed({
      reference,
      reason: "Unable to create signed upload URL",
    });

    throw error;
  }
}

export async function completeMediaUpload({
  mediaId,
  storagePath,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId);

  const snapshot = await reference.get();

  if (!snapshot.exists) {
    throw new NotFoundError("Media upload reservation not found");
  }

  const mediaData = snapshot.data();

  if (mediaData.isDeleted) {
    throw new NotFoundError("Media asset not found");
  }

  if (mediaData.status === MEDIA_STATUSES.ACTIVE) {
    return serializeMediaAsset(snapshot);
  }

  if (mediaData.status !== MEDIA_STATUSES.UPLOADING) {
    throw new ConflictError("Media upload is not awaiting completion");
  }

  if (
    mediaData.storagePath !== storagePath ||
    !storagePath.startsWith(`${MEDIA_STORAGE_ROOT}/`)
  ) {
    throw new InvalidRequestError("Media storage path does not match");
  }

  if (
    mediaData.uploadExpiresAt?.toMillis &&
    mediaData.uploadExpiresAt.toMillis() < Date.now()
  ) {
    throw new InvalidRequestError("Media upload reservation has expired");
  }

  const file = adminBucket.file(storagePath);

  const [exists] = await file.exists();

  if (!exists) {
    throw new NotFoundError("Uploaded file was not found in storage");
  }

  const [storageMetadata] = await file.getMetadata();

  const actualMimeType = storageMetadata.contentType || "";
  const actualSize = Number(storageMetadata.size || 0);

  if (actualMimeType !== mediaData.mimeType) {
    await file.delete({
      ignoreNotFound: true,
    });

    await markUploadAsFailed({
      reference,
      reason: "Uploaded MIME type does not match the reservation",
    });

    throw new InvalidRequestError(
      "Uploaded file type does not match the reservation",
    );
  }

  if (actualSize <= 0 || actualSize !== Number(mediaData.size)) {
    await file.delete({
      ignoreNotFound: true,
    });

    await markUploadAsFailed({
      reference,
      reason: "Uploaded file size does not match the reservation",
    });

    throw new InvalidRequestError(
      "Uploaded file size does not match the reservation",
    );
  }

  const downloadToken = randomUUID();

  await file.setMetadata({
    contentType: mediaData.mimeType,

    cacheControl:
      mediaData.type === MEDIA_TYPES.IMAGE
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600",

    contentDisposition:
      mediaData.type === MEDIA_TYPES.DOCUMENT
        ? `attachment; filename="${mediaData.originalName.replace(
            /["\r\n]/g,
            "",
          )}"`
        : "inline",

    metadata: {
      firebaseStorageDownloadTokens: downloadToken,
      mediaId,
      uploadedBy: actor.uid,
    },
  });

  const publicUrl = createDownloadUrl({
    bucketName: adminBucket.name,
    storagePath,
    downloadToken,
  });

  await adminDb.runTransaction(async (transaction) => {
    const currentSnapshot = await transaction.get(reference);

    if (!currentSnapshot.exists) {
      throw new NotFoundError("Media upload reservation not found");
    }

    const currentData = currentSnapshot.data();

    if (currentData.status === MEDIA_STATUSES.ACTIVE) {
      return;
    }

    if (currentData.status !== MEDIA_STATUSES.UPLOADING) {
      throw new ConflictError("Media upload state has changed");
    }

    const completedData = {
      status: MEDIA_STATUSES.ACTIVE,
      publicUrl,
      downloadToken,

      size: actualSize,
      checksum: storageMetadata.md5Hash || null,

      uploadedAt: FieldValue.serverTimestamp(),

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,

      failureReason: null,
    };

    transaction.update(reference, completedData);

    await writeAuditLog({
      actor,
      action: AUDIT_ACTIONS.MEDIA_UPLOAD,
      entityType: AUDIT_ENTITY_TYPES.MEDIA,
      entityId: mediaId,
      before: currentData,
      after: {
        ...currentData,
        ...completedData,
      },
      metadata: {
        ...requestMetadata,
        storagePath,
        originalName: currentData.originalName,
        mimeType: currentData.mimeType,
        size: actualSize,
      },
      transaction,
    });
  });

  return getMediaAssetById(mediaId);
}

export async function getMediaAssetById(mediaId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.MEDIA)
    .doc(mediaId)
    .get();

  if (!snapshot.exists || snapshot.data()?.isDeleted) {
    throw new NotFoundError("Media asset not found");
  }

  return serializeMediaAsset(snapshot);
}

export async function getMediaAssets({
  limit,
  cursor,
  type,
  folder,
  status,
  search,
  usage,
}) {
  let query = adminDb.collection(COLLECTIONS.MEDIA);

  query = query.where("isDeleted", "==", false);

  query = query.where("status", "==", status || MEDIA_STATUSES.ACTIVE);

  if (type) {
    query = query.where("type", "==", type);
  }

  if (folder) {
    query = query.where("folder", "==", folder);
  }

  if (usage === "used") {
    query = query.where("isUsed", "==", true);
  }

  if (usage === "unused") {
    query = query.where("isUsed", "==", false);
  }

  if (search) {
    const searchToken = search.trim().toLocaleLowerCase().split(/\s+/)[0];

    if (searchToken) {
      query = query.where("searchTokens", "array-contains", searchToken);
    }
  }

  query = query
    .orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId(), "desc");

  const decodedCursor = decodeCursor(cursor);

  if (decodedCursor) {
    query = query.startAfter(
      Timestamp.fromDate(new Date(decodedCursor.createdAt)),
      decodedCursor.documentId,
    );
  }

  const snapshot = await query.limit(limit + 1).get();

  const hasMore = snapshot.docs.length > limit;

  const visibleDocuments = hasMore
    ? snapshot.docs.slice(0, limit)
    : snapshot.docs;

  const items = visibleDocuments.map(serializeMediaAsset);

  const lastDocument = visibleDocuments[visibleDocuments.length - 1];

  const createdAt = lastDocument?.get("createdAt");

  const nextCursor =
    hasMore && lastDocument && createdAt
      ? encodeCursor({
          createdAt: createdAt.toDate().toISOString(),
          documentId: lastDocument.id,
        })
      : null;

  return {
    items,

    pagination: {
      limit,
      count: items.length,
      hasMore,
      nextCursor,
    },
  };
}

export async function updateMediaAsset({
  mediaId,
  input,
  actor,
  requestMetadata = {},
}) {
  const reference = adminDb.collection(COLLECTIONS.MEDIA).doc(mediaId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (!snapshot.exists || snapshot.data()?.isDeleted) {
      throw new NotFoundError("Media asset not found");
    }

    const before = snapshot.data();

    if (before.status !== MEDIA_STATUSES.ACTIVE) {
      throw new ConflictError("Only active media can be updated");
    }

    const title =
      input.title !== undefined
        ? normalizeLocalizedValue(input.title)
        : before.title;

    const altText =
      input.altText !== undefined
        ? normalizeLocalizedValue(input.altText)
        : before.altText;

    const caption =
      input.caption !== undefined
        ? normalizeLocalizedValue(input.caption)
        : before.caption;

    const keywords =
      input.keywords !== undefined
        ? normalizeKeywords(input.keywords)
        : before.keywords;

    const updates = {
      ...(input.title !== undefined ? { title } : {}),
      ...(input.altText !== undefined ? { altText } : {}),
      ...(input.caption !== undefined ? { caption } : {}),
      ...(input.keywords !== undefined ? { keywords } : {}),

      searchTokens: createSearchTokens({
        originalName: before.originalName,
        title,
        altText,
        keywords,
      }),

      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };

    transaction.update(reference, updates);

    await writeAuditLog({
      actor,
      action: AUDIT_ACTIONS.MEDIA_UPDATE,
      entityType: AUDIT_ENTITY_TYPES.MEDIA,
      entityId: mediaId,
      before,
      after: {
        ...before,
        ...updates,
      },
      metadata: requestMetadata,
      transaction,
    });
  });

  return getMediaAssetById(mediaId);
}

export async function deleteMediaAsset({
  mediaId,
  actor,
  requestMetadata = {},
}) {
  const asset = await getMediaAssetById(mediaId);

  if (asset.usageCount > 0) {
    throw new ConflictError(
      "This media asset is currently in use and cannot be deleted",
      {
        usageCount: asset.usageCount,
        usedBy: asset.usedBy,
      },
    );
  }

  return softDeleteEntity({
    entityType: AUDIT_ENTITY_TYPES.MEDIA,
    entityId: mediaId,
    actor,
    requestMetadata,
  });
}
