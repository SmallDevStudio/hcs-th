import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

export async function getSolutions({
  limit = 25,
  cursor,
  status,
  featured,
  showOnHome,
  search,
  signal,
} = {}) {
  const response = await apiClient.get("/solutions", {
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

export async function getSolution(solutionId, { signal } = {}) {
  const response = await apiClient.get(
    `/solutions/${encodeURIComponent(solutionId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function createSolution({ values, signal }) {
  const response = await apiClient.post("/solutions", values, {
    signal,
  });

  return unwrapApiData(response);
}

export async function updateSolution({ solutionId, values, signal }) {
  const response = await apiClient.patch(
    `/solutions/${encodeURIComponent(solutionId)}`,
    values,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteSolution(solutionId, { signal } = {}) {
  const response = await apiClient.delete(
    `/solutions/${encodeURIComponent(solutionId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function reorderSolutions({ items, signal }) {
  const response = await apiClient.put(
    "/solutions/reorder",
    {
      items,
    },
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
