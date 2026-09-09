import "server-only";

import { FieldPath, Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { InvalidRequestError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { CONTACT_MESSAGE_STATUSES } from "@/modules/contact-messages/contact-message.constants";

const SEARCH_SCAN_LIMIT = 250;

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

  if (typeof value === "string") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

function serializeAttachment(value) {
  if (!value) {
    return null;
  }

  return {
    originalName: value.originalName || "",

    storagePath: value.storagePath || "",

    publicUrl: value.publicUrl || "",

    mimeType: value.mimeType || "",

    size: Number(value.size || 0),
  };
}

function serializeDeliveryChannel(value) {
  if (!value) {
    return null;
  }

  return {
    status: value.status || "pending",
    reason: value.reason || "",
    error: value.error || "",

    attemptedAt: serializeTimestamp(value.attemptedAt),

    deliveredAt: serializeTimestamp(value.deliveredAt),

    messageId: value.messageId || "",

    accepted: Array.isArray(value.accepted) ? value.accepted : [],

    rejected: Array.isArray(value.rejected) ? value.rejected : [],

    sentCount: Number(value.sentCount || 0),

    failedCount: Number(value.failedCount || 0),

    results: Array.isArray(value.results) ? value.results : [],
  };
}

function serializeNotificationDelivery(value) {
  if (!value) {
    return null;
  }

  return {
    inApp: serializeDeliveryChannel(value.inApp),

    email: serializeDeliveryChannel(value.email),

    line: serializeDeliveryChannel(value.line),

    processedAt: serializeTimestamp(value.processedAt),
  };
}

export function serializeContactMessageDocument(document) {
  const data = document.data();

  return {
    id: document.id,

    fullName: data.fullName || "",
    company: data.company || "",
    email: data.email || "",
    phone: data.phone || "",

    enquiryType: data.enquiryType || "general",

    productCategory: data.productCategory || "",

    projectName: data.projectName || "",

    projectLocation: data.projectLocation || "",

    message: data.message || "",

    attachment: serializeAttachment(data.attachment),

    locale: data.locale === "th" ? "th" : "en",

    privacyAccepted: Boolean(data.privacyAccepted),

    privacyAcceptedAt: serializeTimestamp(data.privacyAcceptedAt),

    status: data.status || CONTACT_MESSAGE_STATUSES.NEW,

    internalNote: data.internalNote || "",

    assignedTo: data.assignedTo || "",

    source: {
      page: data.source?.page || "",

      referer: data.source?.referer || "",
    },

    request: {
      userAgent: data.request?.userAgent || "",
    },

    notificationDelivery: serializeNotificationDelivery(
      data.notificationDelivery,
    ),

    createdAt: serializeTimestamp(data.createdAt),

    updatedAt: serializeTimestamp(data.updatedAt),

    updatedBy: data.updatedBy || null,
  };
}

function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

function messageMatchesSearch(message, search) {
  const normalizedSearch = normalizeSearchValue(search);

  if (!normalizedSearch) {
    return true;
  }

  const searchableValues = [
    message.fullName,
    message.company,
    message.email,
    message.phone,
    message.enquiryType,
    message.productCategory,
    message.projectName,
    message.projectLocation,
    message.message,
    message.internalNote,
    message.assignedTo,
  ];

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedSearch),
  );
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
    throw new InvalidRequestError("Invalid contact message cursor");
  }
}

function createBaseQuery({ status }) {
  let query = adminDb
    .collection(COLLECTIONS.CONTACT_MESSAGES)
    .where("isDeleted", "==", false);

  if (status) {
    query = query.where("status", "==", status);
  }

  return query
    .orderBy("createdAt", "desc")
    .orderBy(FieldPath.documentId(), "desc");
}

async function getSearchedMessages({ query, limit, search }) {
  const snapshot = await query.limit(SEARCH_SCAN_LIMIT).get();

  const matchedMessages = snapshot.docs
    .map(serializeContactMessageDocument)
    .filter((message) => messageMatchesSearch(message, search));

  const hasMore = matchedMessages.length > limit;

  const items = matchedMessages.slice(0, limit);

  return {
    items,

    pagination: {
      limit,
      count: items.length,
      hasMore,
      nextCursor: null,
    },
  };
}

export async function getContactMessages({ limit, cursor, status, search }) {
  const query = createBaseQuery({
    status,
  });

  if (search) {
    if (cursor) {
      throw new InvalidRequestError(
        "Cursor pagination is unavailable while searching contact messages",
      );
    }

    return getSearchedMessages({
      query,
      limit,
      search,
    });
  }

  const decodedCursor = decodeCursor(cursor);

  const paginatedQuery = decodedCursor
    ? query.startAfter(
        Timestamp.fromDate(new Date(decodedCursor.createdAt)),

        decodedCursor.documentId,
      )
    : query;

  const snapshot = await paginatedQuery.limit(limit + 1).get();

  const hasMore = snapshot.docs.length > limit;

  const visibleDocuments = hasMore
    ? snapshot.docs.slice(0, limit)
    : snapshot.docs;

  const items = visibleDocuments.map(serializeContactMessageDocument);

  const lastDocument = visibleDocuments.at(-1);

  const lastCreatedAt = lastDocument?.get("createdAt");

  const nextCursor =
    hasMore && lastDocument && lastCreatedAt
      ? encodeCursor({
          createdAt: serializeTimestamp(lastCreatedAt),

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

export async function getContactMessageById(messageId) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.CONTACT_MESSAGES)
    .doc(messageId)
    .get();

  if (!snapshot.exists || snapshot.data()?.isDeleted) {
    throw new NotFoundError("Contact message not found");
  }

  return serializeContactMessageDocument(snapshot);
}
