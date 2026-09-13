import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

function normalizePagination({ pagination, limit, itemCount }) {
  const normalizedLimit = Number(pagination?.limit || limit);

  const total = Number(pagination?.total);

  if (!Number.isFinite(total) || total < 0) {
    throw new Error(
      "Product pagination total is missing. Update the Products API and product query service.",
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / normalizedLimit));

  return {
    limit: normalizedLimit,

    count: Number(pagination?.count ?? itemCount),

    total,
    totalPages,

    hasMore: pagination?.hasMore === true,

    nextCursor: pagination?.nextCursor || null,
  };
}

export async function getProducts({
  limit = 20,
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

  const items = Array.isArray(response?.data) ? response.data : [];

  return {
    items,

    pagination: normalizePagination({
      pagination: response?.meta?.pagination,

      limit,
      itemCount: items.length,
    }),

    filters: response?.meta?.filters || null,
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

export async function bulkUpdateProducts({ action, productIds, signal }) {
  const response = await apiClient.post(
    "/products/bulk",
    {
      action,
      productIds,
    },
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
