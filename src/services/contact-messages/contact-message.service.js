import "server-only";

import crypto from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { adminDb } from "@/lib/firebase/admin";
import { CONTACT_MESSAGE_STATUSES } from "@/modules/contact-messages/contact-message.constants";
import { createContactMessageSchema } from "@/modules/contact-messages/contact-message.schema";
import { verifyContactAttachment } from "@/services/contact-messages/contact-attachment.service";

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

export async function createContactMessage({ input, requestMetadata = {} }) {
  const validatedInput = createContactMessageSchema.parse(input);

  const attachment = await verifyContactAttachment(
    validatedInput.attachmentUploadToken,
  );

  const messageReference = adminDb
    .collection(COLLECTIONS.CONTACT_MESSAGES)
    .doc();

  const messageData = cleanUndefined({
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

    isDeleted: false,
    deletedAt: null,
    deletedBy: null,

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await messageReference.set(messageData);

  return {
    id: messageReference.id,
    status: messageData.status,
  };
}
