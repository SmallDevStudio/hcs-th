import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

export async function getUserGroups({
  limit = 100,
  cursor,
  status,
  search,
  signal,
} = {}) {
  const response = await apiClient.get("/user-groups", {
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
    items: Array.isArray(response?.data) ? response.data : [],

    pagination: response?.meta?.pagination || {
      limit,
      count: 0,
      hasMore: false,
      nextCursor: null,
    },

    filters: response?.meta?.filters || null,
  };
}

export async function getUserGroup(groupId, { signal } = {}) {
  const response = await apiClient.get(
    `/user-groups/${encodeURIComponent(groupId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function createUserGroup({ values, signal }) {
  const response = await apiClient.post("/user-groups", values, {
    signal,
  });

  return unwrapApiData(response);
}

export async function updateUserGroup({ groupId, values, signal }) {
  const response = await apiClient.patch(
    `/user-groups/${encodeURIComponent(groupId)}`,
    values,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteUserGroup(groupId, { signal } = {}) {
  const response = await apiClient.delete(
    `/user-groups/${encodeURIComponent(groupId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
