import axios from "axios";

import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

export async function getMediaAssets({
  limit = 24,
  cursor,
  type,
  folder,
  status,
  search,
  usage = "all",
  signal,
} = {}) {
  const response = await apiClient.get("/media", {
    params: {
      limit,
      ...(cursor ? { cursor } : {}),
      ...(type ? { type } : {}),
      ...(folder ? { folder } : {}),
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
      ...(usage ? { usage } : {}),
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

export async function getMediaAsset(mediaId, { signal } = {}) {
  const response = await apiClient.get(
    `/media/${encodeURIComponent(mediaId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function createMediaUploadReservation({
  file,
  folder,
  title,
  altText,
  caption,
  keywords,
  signal,
}) {
  const response = await apiClient.post(
    "/media/upload-url",
    {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      folder,

      title: {
        en: title?.en || "",
        th: title?.th || "",
      },

      altText: {
        en: altText?.en || "",
        th: altText?.th || "",
      },

      caption: {
        en: caption?.en || "",
        th: caption?.th || "",
      },

      keywords: Array.isArray(keywords) ? keywords : [],
    },
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function uploadFileToSignedUrl({
  signedUploadUrl,
  file,
  requiredHeaders = {},
  signal,
  onProgress,
}) {
  const response = await axios.put(signedUploadUrl, file, {
    headers: {
      ...requiredHeaders,
      "Content-Type": file.type,
    },

    signal,

    timeout: 0,

    onUploadProgress: (progressEvent) => {
      if (typeof onProgress !== "function") {
        return;
      }

      const total = progressEvent.total || file.size || 0;

      const loaded = progressEvent.loaded || 0;

      const percentage =
        total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

      onProgress({
        loaded,
        total,
        percentage,
      });
    },

    transformRequest: [(requestData) => requestData],
  });

  return response;
}

export async function completeMediaUpload({ mediaId, storagePath, signal }) {
  const response = await apiClient.post(
    `/media/${encodeURIComponent(mediaId)}/complete`,
    {
      storagePath,
    },
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function uploadMediaAsset({
  file,
  folder,
  title = {
    en: "",
    th: "",
  },
  altText = {
    en: "",
    th: "",
  },
  caption = {
    en: "",
    th: "",
  },
  keywords = [],
  signal,
  onProgress,
  onStageChange,
}) {
  if (!(file instanceof File)) {
    throw {
      message: "A file is required",
      code: "FILE_REQUIRED",
      details: null,
      status: 422,
    };
  }

  if (typeof onStageChange === "function") {
    onStageChange("preparing");
  }

  const reservation = await createMediaUploadReservation({
    file,
    folder,
    title,
    altText,
    caption,
    keywords,
    signal,
  });

  if (
    !reservation?.mediaId ||
    !reservation?.storagePath ||
    !reservation?.signedUploadUrl
  ) {
    throw {
      message: "Invalid media upload reservation",
      code: "INVALID_UPLOAD_RESERVATION",
      details: reservation,
      status: 500,
    };
  }

  if (typeof onStageChange === "function") {
    onStageChange("uploading");
  }

  await uploadFileToSignedUrl({
    signedUploadUrl: reservation.signedUploadUrl,
    file,
    requiredHeaders: reservation.requiredHeaders,
    signal,
    onProgress,
  });

  if (typeof onStageChange === "function") {
    onStageChange("processing");
  }

  const asset = await completeMediaUpload({
    mediaId: reservation.mediaId,
    storagePath: reservation.storagePath,
    signal,
  });

  if (typeof onProgress === "function") {
    onProgress({
      loaded: file.size,
      total: file.size,
      percentage: 100,
    });
  }

  if (typeof onStageChange === "function") {
    onStageChange("completed");
  }

  return asset;
}

export async function updateMediaAsset({
  mediaId,
  title,
  altText,
  caption,
  keywords,
  signal,
}) {
  const payload = {
    ...(title !== undefined ? { title } : {}),
    ...(altText !== undefined ? { altText } : {}),
    ...(caption !== undefined ? { caption } : {}),
    ...(keywords !== undefined ? { keywords } : {}),
  };

  const response = await apiClient.patch(
    `/media/${encodeURIComponent(mediaId)}`,
    payload,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteMediaAsset(mediaId, { signal } = {}) {
  const response = await apiClient.delete(
    `/media/${encodeURIComponent(mediaId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
