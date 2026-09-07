import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

export async function getStandards({
  limit = 25,
  cursor,
  status,
  documentType,
  documentLanguage,
  categoryId,
  productId,
  featured,
  showOnHome,
  search,
  signal,
} = {}) {
  const response = await apiClient.get("/standards", {
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

      ...(documentType
        ? {
            documentType,
          }
        : {}),

      ...(documentLanguage
        ? {
            documentLanguage,
          }
        : {}),

      ...(categoryId
        ? {
            categoryId,
          }
        : {}),

      ...(productId
        ? {
            productId,
          }
        : {}),

      ...(featured !== undefined
        ? {
            featured,
          }
        : {}),

      ...(showOnHome !== undefined
        ? {
            showOnHome,
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

export async function getStandard(standardId, { signal } = {}) {
  const response = await apiClient.get(
    `/standards/${encodeURIComponent(standardId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function createStandard({ values, signal }) {
  const response = await apiClient.post("/standards", values, {
    signal,
  });

  return unwrapApiData(response);
}

export async function updateStandard({ standardId, values, signal }) {
  const response = await apiClient.patch(
    `/standards/${encodeURIComponent(standardId)}`,
    values,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteStandard(standardId, { signal } = {}) {
  const response = await apiClient.delete(
    `/standards/${encodeURIComponent(standardId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function reorderStandards({ items, signal }) {
  const response = await apiClient.put(
    "/standards/reorder",
    {
      items,
    },
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
