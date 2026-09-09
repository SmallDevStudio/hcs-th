import axios from "axios";

import { apiClient } from "@/services/http/axios";

const CONTACT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

const CONTACT_ATTACHMENT_MIME_TYPES = [
  "application/pdf",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function unwrapApiData(response) {
  return response?.data ?? null;
}

export function validateContactAttachmentFile(file) {
  if (!(file instanceof File)) {
    throw {
      message: "A file is required",
      code: "FILE_REQUIRED",
      status: 422,
    };
  }

  if (!CONTACT_ATTACHMENT_MIME_TYPES.includes(file.type)) {
    throw {
      message: "Only PDF and DOCX files are supported",

      code: "INVALID_FILE_TYPE",
      status: 422,
    };
  }

  if (file.size <= 0 || file.size > CONTACT_ATTACHMENT_MAX_BYTES) {
    throw {
      message: "Attachment must not exceed 10 MB",

      code: "FILE_TOO_LARGE",
      status: 422,
    };
  }
}

export async function prepareContactAttachmentUpload({ file, signal }) {
  validateContactAttachmentFile(file);

  const response = await apiClient.post(
    "/contact-attachments/upload-url",

    {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    },

    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function uploadContactAttachment({ file, signal, onProgress }) {
  const reservation = await prepareContactAttachmentUpload({
    file,
    signal,
  });

  if (!reservation?.signedUploadUrl || !reservation?.uploadToken) {
    throw {
      message: "Invalid contact attachment upload reservation",

      code: "INVALID_UPLOAD_RESERVATION",

      status: 500,
    };
  }

  await axios.put(reservation.signedUploadUrl, file, {
    headers: {
      ...reservation.requiredHeaders,

      "Content-Type": file.type,
    },

    signal,

    timeout: 0,

    transformRequest: [(requestData) => requestData],

    onUploadProgress: (progressEvent) => {
      if (typeof onProgress !== "function") {
        return;
      }

      const total = progressEvent.total || file.size || 0;

      const loaded = progressEvent.loaded || 0;

      const percentage =
        total > 0
          ? Math.min(
              100,

              Math.round((loaded / total) * 100),
            )
          : 0;

      onProgress({
        loaded,
        total,
        percentage,
      });
    },
  });

  if (typeof onProgress === "function") {
    onProgress({
      loaded: file.size,
      total: file.size,
      percentage: 100,
    });
  }

  return {
    uploadToken: reservation.uploadToken,

    expiresAt: reservation.expiresAt,
  };
}

export async function submitContactMessage({ input, signal }) {
  const response = await apiClient.post("/contact-messages", input, {
    signal,
  });

  return unwrapApiData(response);
}

export async function getContactMessages({
  limit = 25,
  cursor,
  status,
  search,
  signal,
} = {}) {
  const response = await apiClient.get("/contact-messages", {
    params: {
      limit,

      ...(cursor
        ? {
            cursor,
          }
        : {}),

      ...(status
        ? {
            status,
          }
        : {}),

      ...(search
        ? {
            search,
          }
        : {}),
    },

    signal,
  });

  return {
    items: Array.isArray(response.data) ? response.data : [],

    pagination: response.meta?.pagination || {
      limit,
      count: 0,
      hasMore: false,
      nextCursor: null,
    },

    filters: response.meta?.filters || null,
  };
}

export async function getContactMessage(messageId, { signal } = {}) {
  const response = await apiClient.get(
    `/contact-messages/${encodeURIComponent(messageId)}`,

    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function updateContactMessage({ messageId, values, signal }) {
  const response = await apiClient.patch(
    `/contact-messages/${encodeURIComponent(messageId)}`,

    values,

    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteContactMessage(messageId, { signal } = {}) {
  const response = await apiClient.delete(
    `/contact-messages/${encodeURIComponent(messageId)}`,

    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function getContactAttachmentDownload(messageId, { signal } = {}) {
  const response = await apiClient.get(
    `/contact-messages/${encodeURIComponent(messageId)}/attachment`,

    {
      signal,
    },
  );

  return unwrapApiData(response);
}
