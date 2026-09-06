import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

export async function getCategories({
  limit = 25,
  cursor,
  status,
  search,
  signal,
} = {}) {
  const response = await apiClient.get("/categories", {
    params: {
      limit,

      ...(cursor ? { cursor } : {}),

      ...(status ? { status } : {}),

      ...(search ? { search } : {}),
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

export async function getCategory(categoryId, { signal } = {}) {
  const response = await apiClient.get(
    `/categories/${encodeURIComponent(categoryId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function createCategory({ values, signal }) {
  const response = await apiClient.post("/categories", values, {
    signal,
  });

  return unwrapApiData(response);
}

export async function updateCategory({ categoryId, values, signal }) {
  const response = await apiClient.patch(
    `/categories/${encodeURIComponent(categoryId)}`,
    values,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteCategory(categoryId, { signal } = {}) {
  const response = await apiClient.delete(
    `/categories/${encodeURIComponent(categoryId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function reorderCategories({ items, signal }) {
  const response = await apiClient.put(
    "/categories/reorder",
    {
      items,
    },
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
