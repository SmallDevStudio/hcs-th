import "server-only";

import crypto from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from "@/constants/audit";
import { COLLECTIONS } from "@/constants/collections";
import { ConflictError, NotFoundError } from "@/lib/api/errors";
import { adminDb } from "@/lib/firebase/admin";
import { CONTACT_MESSAGE_STATUSES } from "@/modules/contact-messages/contact-message.constants";
import {
  createContactMessageSchema,
  updateContactMessageSchema,
} from "@/modules/contact-messages/contact-message.schema";
import { writeAuditLog } from "@/services/audit/audit.service";
import { verifyContactAttachment } from "@/services/contact-messages/contact-attachment.service";
import { getContactMessageById } from "@/services/contact-messages/contact-message-query.service";
import { dispatchContactNotifications } from "@/services/notifications/contact-notification.service";
import { softDeleteEntity } from "@/services/trash/trash.service";

function cleanUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(cleanUndefined);
  }

  if (
    value &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    typeof value.toDate !== "function"
  ) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, childValue]) => childValue !== undefined)
        .map(([key, childValue]) => [key, cleanUndefined(childValue)]),
    );
  }

  return value;
}

function createRequestFingerprint(value = "") {
  if (!value) {
    return "";
  }

  const secret =
    process.env.AUTH_SECRET ||
    process.env.REVALIDATE_SECRET ||
    "hcs-contact-message";

  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function createInitialNotificationDelivery() {
  return {
    inApp: {
      status: "pending",
      reason: "",
      attemptedAt: null,
      deliveredAt: null,
      error: "",
    },

    email: {
      status: "pending",
      reason: "",
      attemptedAt: null,
      deliveredAt: null,
      error: "",
    },

    line: {
      status: "pending",
      reason: "",
      attemptedAt: null,
      deliveredAt: null,
      error: "",
    },

    processedAt: null,
  };
}

function getRequestMetadata(requestMetadata = {}) {
  return {
    ipAddress: requestMetadata.ipAddress || "",

    userAgent: requestMetadata.userAgent || "",
  };
}

export async function createContactMessage({ input, requestMetadata = {} }) {
  const validatedInput = createContactMessageSchema.parse(input);

  const attachment = await verifyContactAttachment(
    validatedInput.attachmentUploadToken,
  );

  const messageReference = adminDb
    .collection(COLLECTIONS.CONTACT_MESSAGES)
    .doc();

  const notificationMessage = {
    fullName: validatedInput.fullName,
    company: validatedInput.company,
    email: validatedInput.email,
    phone: validatedInput.phone,

    enquiryType: validatedInput.enquiryType,

    productCategory: validatedInput.productCategory,

    projectName: validatedInput.projectName,

    projectLocation: validatedInput.projectLocation,

    message: validatedInput.message,

    attachment,

    locale: validatedInput.locale,
  };

  const messageData = cleanUndefined({
    ...notificationMessage,

    privacyAccepted: true,

    privacyAcceptedAt: FieldValue.serverTimestamp(),

    status: CONTACT_MESSAGE_STATUSES.NEW,

    internalNote: "",
    assignedTo: "",

    source: {
      page: requestMetadata.page || "/contact",

      referer: requestMetadata.referer || "",
    },

    request: {
      ipHash: createRequestFingerprint(requestMetadata.ipAddress),

      userAgent: requestMetadata.userAgent?.slice(0, 500) || "",
    },

    notificationDelivery: createInitialNotificationDelivery(),

    isDeleted: false,
    deletedAt: null,
    deletedBy: null,

    createdAt: FieldValue.serverTimestamp(),

    updatedAt: FieldValue.serverTimestamp(),
  });

  await messageReference.set(messageData);

  try {
    await dispatchContactNotifications({
      messageId: messageReference.id,

      message: notificationMessage,
    });
  } catch (error) {
    console.error("Unable to dispatch contact notifications:", error);

    try {
      await messageReference.set(
        {
          notificationDelivery: {
            ...createInitialNotificationDelivery(),

            email: {
              status: "failed",
              reason: "",

              attemptedAt: FieldValue.serverTimestamp(),

              deliveredAt: null,

              error: String(
                error?.message || "Unable to dispatch notifications",
              ).slice(0, 1000),
            },

            line: {
              status: "failed",
              reason: "",

              attemptedAt: FieldValue.serverTimestamp(),

              deliveredAt: null,

              error: String(
                error?.message || "Unable to dispatch notifications",
              ).slice(0, 1000),
            },

            processedAt: FieldValue.serverTimestamp(),
          },
        },
        {
          merge: true,
        },
      );
    } catch (recordError) {
      console.error(
        "Unable to record contact notification failure:",
        recordError,
      );
    }
  }

  return {
    id: messageReference.id,

    status: CONTACT_MESSAGE_STATUSES.NEW,
  };
}

export async function updateContactMessage({
  messageId,
  input,
  actor,
  requestMetadata = {},
}) {
  const validatedInput = updateContactMessageSchema.parse(input);

  const messageReference = adminDb
    .collection(COLLECTIONS.CONTACT_MESSAGES)
    .doc(messageId);

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(messageReference);

    if (!snapshot.exists) {
      throw new NotFoundError("Contact message not found");
    }

    const existingData = snapshot.data();

    if (existingData.isDeleted) {
      throw new ConflictError("Deleted contact messages cannot be updated");
    }

    const updatedFields = cleanUndefined({
      ...(validatedInput.status !== undefined
        ? {
            status: validatedInput.status,
          }
        : {}),

      ...(validatedInput.internalNote !== undefined
        ? {
            internalNote: validatedInput.internalNote,
          }
        : {}),

      ...(validatedInput.assignedTo !== undefined
        ? {
            assignedTo: validatedInput.assignedTo,
          }
        : {}),

      updatedAt: FieldValue.serverTimestamp(),

      updatedBy: actor.uid,
    });

    transaction.update(messageReference, updatedFields);

    await writeAuditLog({
      actor,

      action: AUDIT_ACTIONS.MESSAGE_UPDATE,

      entityType: AUDIT_ENTITY_TYPES.MESSAGE,

      entityId: messageId,

      before: {
        status: existingData.status || CONTACT_MESSAGE_STATUSES.NEW,

        internalNote: existingData.internalNote || "",

        assignedTo: existingData.assignedTo || "",
      },

      after: {
        status:
          validatedInput.status ??
          existingData.status ??
          CONTACT_MESSAGE_STATUSES.NEW,

        internalNote:
          validatedInput.internalNote ?? existingData.internalNote ?? "",

        assignedTo: validatedInput.assignedTo ?? existingData.assignedTo ?? "",
      },

      metadata: getRequestMetadata(requestMetadata),

      transaction,
    });
  });

  return getContactMessageById(messageId);
}

export async function deleteContactMessage({
  messageId,
  actor,
  requestMetadata = {},
}) {
  return softDeleteEntity({
    entityType: AUDIT_ENTITY_TYPES.MESSAGE,

    entityId: messageId,

    actor,

    requestMetadata: getRequestMetadata(requestMetadata),
  });
}
