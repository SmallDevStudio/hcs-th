import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

export async function getProjects({
  limit = 25,
  cursor,
  status,
  buildingType,
  featured,
  showOnHome,
  search,
  signal,
} = {}) {
  const response = await apiClient.get("/projects", {
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

      ...(buildingType
        ? {
            buildingType,
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

export async function getProject(projectId, { signal } = {}) {
  const response = await apiClient.get(
    `/projects/${encodeURIComponent(projectId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function createProject({ values, signal }) {
  const response = await apiClient.post("/projects", values, {
    signal,
  });

  return unwrapApiData(response);
}

export async function updateProject({ projectId, values, signal }) {
  const response = await apiClient.patch(
    `/projects/${encodeURIComponent(projectId)}`,
    values,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function deleteProject(projectId, { signal } = {}) {
  const response = await apiClient.delete(
    `/projects/${encodeURIComponent(projectId)}`,
    {
      signal,
    },
  );

  return unwrapApiData(response);
}

export async function reorderProjects({ items, signal }) {
  const response = await apiClient.put(
    "/projects/reorder",
    {
      items,
    },
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
