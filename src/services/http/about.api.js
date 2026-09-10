import { apiClient } from "@/services/http/axios";

function unwrapApiData(response) {
  return response?.data ?? null;
}

function createVersionHeaders(expectedDraftVersion) {
  return {
    "If-Match": `"${Number(expectedDraftVersion)}"`,
  };
}

function createItemPayload(item) {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    value: item.value,
    icon: item.icon,
    imageMediaId: item.imageMediaId || null,
    imageAlt: item.imageAlt,
    sortOrder: item.sortOrder,
  };
}

function createSectionPayload(section) {
  return {
    id: section.id,
    type: section.type,
    enabled: section.enabled,
    internalLabel: section.internalLabel,
    eyebrow: section.eyebrow,
    title: section.title,
    content: section.content,
    imageMediaId: section.imageMediaId || null,
    imageAlt: section.imageAlt,
    layout: section.layout,

    actions: Array.isArray(section.actions)
      ? section.actions.map((action) => ({
          id: action.id,
          label: action.label,
          href: action.href,
          style: action.style,
          openInNewTab: action.openInNewTab,
        }))
      : [],

    items: Array.isArray(section.items)
      ? section.items.map(createItemPayload)
      : [],

    sortOrder: section.sortOrder,
  };
}

export function createAboutDraftPayload(values) {
  return {
    seo: {
      title: values?.seo?.title,
      description: values?.seo?.description,
      imageMediaId: values?.seo?.imageMediaId || null,
      imageAlt: values?.seo?.imageAlt,
    },

    sections: Array.isArray(values?.sections)
      ? values.sections.map(createSectionPayload)
      : [],
  };
}

export async function getAboutPage({ signal } = {}) {
  const response = await apiClient.get("/about", {
    signal,
  });

  return unwrapApiData(response);
}

export async function saveAboutPageDraft({
  values,
  expectedDraftVersion,
  signal,
}) {
  const response = await apiClient.patch(
    "/about",
    createAboutDraftPayload(values),
    {
      headers: createVersionHeaders(expectedDraftVersion),

      signal,
    },
  );

  return unwrapApiData(response);
}

export async function publishAboutPage({ expectedDraftVersion, signal }) {
  const response = await apiClient.post(
    "/about/publish",
    {},
    {
      headers: createVersionHeaders(expectedDraftVersion),

      signal,
    },
  );

  return unwrapApiData(response);
}

export async function unpublishAboutPage({ signal } = {}) {
  const response = await apiClient.post(
    "/about/unpublish",
    {},
    {
      signal,
    },
  );

  return unwrapApiData(response);
}
