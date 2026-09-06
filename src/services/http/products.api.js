import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

export async function getProducts({
  limit = 25,
  cursor,
  status,
  categoryId,
  productTypeSlug,
  standard,
  featured,
  showOnHome,
  fireRated,
  search,
  signal,
} = {}) {
  const response = await apiClient.get("/products", {
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

      ...(categoryId
        ? {
            categoryId,
          }
        : {}),

      ...(productTypeSlug
        ? {
            productTypeSlug,
          }
        : {}),

      ...(standard
        ? {
            standard,
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

      ...(fireRated !== undefined
        ? {
            fireRated,
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

export async function getProduct(productId, { signal } = {}) {
  const response = await apiClient.get(
    `/products/${encodeURIComponent(productId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function createProduct({ values, signal }) {
  const response = await apiClient.post("/products", values, {
    signal,
  });

  return unwrapApiData(response);
}

export async function updateProduct({ productId, values, signal }) {
  const response = await apiClient.patch(
    `/products/${encodeURIComponent(productId)}`,
    values,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteProduct(productId, { signal } = {}) {
  const response = await apiClient.delete(
    `/products/${encodeURIComponent(productId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function reorderProducts({ items, signal }) {
  const response = await apiClient.put(
    "/products/reorder",
    {
      items,
    },
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
