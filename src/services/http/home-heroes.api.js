import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

export async function getHomeHeroes({ limit = 25, status, signal } = {}) {
  const response = await apiClient.get("/home/heroes", {
    params: {
      limit,

      ...(status
        ? {
            status,
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

export async function getHomeHero(heroId, { signal } = {}) {
  const response = await apiClient.get(
    `/home/heroes/${encodeURIComponent(heroId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function createHomeHero({ values, signal }) {
  const response = await apiClient.post("/home/heroes", values, {
    signal,
  });

  return unwrapApiData(response);
}

export async function updateHomeHero({ heroId, values, signal }) {
  const response = await apiClient.patch(
    `/home/heroes/${encodeURIComponent(heroId)}`,
    values,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteHomeHero(heroId, { signal } = {}) {
  const response = await apiClient.delete(
    `/home/heroes/${encodeURIComponent(heroId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function reorderHomeHeroes({ items, signal }) {
  const response = await apiClient.put(
    "/home/heroes/reorder",
    {
      items,
    },
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
