import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

export async function getUsers({
  limit = 25,
  cursor,
  role,
  status,
  groupId,
  search,
  signal,
} = {}) {
  const response = await apiClient.get("/users", {
    params: {
      limit,

      ...(cursor ? { cursor } : {}),

      ...(role ? { role } : {}),

      ...(status ? { status } : {}),

      ...(groupId ? { groupId } : {}),

      ...(search ? { search } : {}),
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

    options: response?.meta?.options || {
      roles: [],
      statuses: [],
      canManageSuperadmins: false,
    },
  };
}

export async function getUser(userId, { signal } = {}) {
  const response = await apiClient.get(`/users/${encodeURIComponent(userId)}`, {
    signal,
  });

  return unwrapApiData(response);
}

export async function createUser({ values, signal }) {
  const response = await apiClient.post("/users", values, {
    signal,
  });

  return unwrapApiData(response);
}

export async function updateUser({ userId, values, signal }) {
  const response = await apiClient.patch(
    `/users/${encodeURIComponent(userId)}`,
    values,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteUser(userId, { signal } = {}) {
  const response = await apiClient.delete(
    `/users/${encodeURIComponent(userId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function setUserPassword({ userId, values, signal }) {
  const response = await apiClient.post(
    `/users/${encodeURIComponent(userId)}/password-reset`,
    values,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
