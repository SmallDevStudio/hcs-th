import "server-only";

import {
  ABOUT_EMPTY_RICH_TEXT,
  ABOUT_IMAGE_POSITIONS,
  ABOUT_IMAGE_RATIOS,
  ABOUT_PAGE_ID,
  ABOUT_PAGE_STATUSES,
  ABOUT_SECTION_LAYOUTS,
  ABOUT_SECTION_TYPES,
} from "@/constants/about";

function serializeTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function cloneJson(value, fallback = null) {
  if (value === undefined || value === null) {
    return structuredClone(fallback);
  }

  return structuredClone(value);
}

function serializeLocalizedText(value) {
  return {
    en: String(value?.en || ""),
    th: String(value?.th || ""),
  };
}

function serializeLocalizedRichText(value) {
  return {
    en: cloneJson(value?.en, ABOUT_EMPTY_RICH_TEXT),
    th: cloneJson(value?.th, ABOUT_EMPTY_RICH_TEXT),
  };
}

function serializeMediaSnapshot(value) {
  if (!value) {
    return null;
  }

  return {
    id: value.id || null,
    publicUrl: value.publicUrl || null,
    storagePath: value.storagePath || null,
    originalName: value.originalName || "",
    mimeType: value.mimeType || "",
    width: value.width || null,
    height: value.height || null,
    title: serializeLocalizedText(value.title),
    altText: serializeLocalizedText(value.altText),
  };
}

function serializeAction(value) {
  return {
    id: value?.id || "",
    label: serializeLocalizedText(value?.label),
    href: value?.href || "",
    style: value?.style || "primary",
    openInNewTab: value?.openInNewTab === true,
  };
}

function serializeItem(value) {
  return {
    id: value?.id || "",
    title: serializeLocalizedText(value?.title),
    content: serializeLocalizedRichText(value?.content),
    value: serializeLocalizedText(value?.value),
    icon: value?.icon || "",
    imageMediaId: value?.imageMediaId || null,
    image: serializeMediaSnapshot(value?.image),
    imageAlt: serializeLocalizedText(value?.imageAlt),
    sortOrder: Number(value?.sortOrder || 0),
  };
}

function serializeLayout(value) {
  return {
    variant: value?.variant || ABOUT_SECTION_LAYOUTS.SPLIT,
    imagePosition: value?.imagePosition || ABOUT_IMAGE_POSITIONS.RIGHT,
    imageRatio: value?.imageRatio || ABOUT_IMAGE_RATIOS.STANDARD,
    contentAlignment: value?.contentAlignment || "left",
    background: value?.background || "white",
  };
}

export function serializeAboutSection(value) {
  return {
    id: value?.id || "",
    type: value?.type || ABOUT_SECTION_TYPES.RICH_CONTENT,
    enabled: value?.enabled !== false,

    internalLabel: serializeLocalizedText(value?.internalLabel),
    eyebrow: serializeLocalizedText(value?.eyebrow),
    title: serializeLocalizedText(value?.title),
    content: serializeLocalizedRichText(value?.content),

    imageMediaId: value?.imageMediaId || null,
    image: serializeMediaSnapshot(value?.image),
    imageAlt: serializeLocalizedText(value?.imageAlt),

    layout: serializeLayout(value?.layout),

    actions: Array.isArray(value?.actions)
      ? value.actions.map(serializeAction)
      : [],

    items: Array.isArray(value?.items)
      ? value.items
          .map(serializeItem)
          .sort(
            (firstItem, secondItem) =>
              firstItem.sortOrder - secondItem.sortOrder,
          )
      : [],

    sortOrder: Number(value?.sortOrder || 0),
  };
}

function serializeSeo(value) {
  return {
    title: serializeLocalizedText(value?.title),
    description: serializeLocalizedText(value?.description),
    imageMediaId: value?.imageMediaId || null,
    image: serializeMediaSnapshot(value?.image),
    imageAlt: serializeLocalizedText(value?.imageAlt),
  };
}

export function serializeAboutContent(value) {
  if (!value) {
    return null;
  }

  return {
    seo: serializeSeo(value.seo),

    sections: Array.isArray(value.sections)
      ? value.sections
          .map(serializeAboutSection)
          .sort(
            (firstSection, secondSection) =>
              firstSection.sortOrder - secondSection.sortOrder,
          )
      : [],

    updatedAt: serializeTimestamp(value.updatedAt),
    updatedBy: value.updatedBy || null,

    publishedAt: serializeTimestamp(value.publishedAt),
    publishedBy: value.publishedBy || null,
  };
}

export function createEmptyAboutPage() {
  return {
    id: ABOUT_PAGE_ID,
    pageType: ABOUT_PAGE_ID,
    status: ABOUT_PAGE_STATUSES.DRAFT,

    draftVersion: 0,
    publishedVersion: 0,

    draft: {
      seo: {
        title: {
          en: "",
          th: "",
        },

        description: {
          en: "",
          th: "",
        },

        imageMediaId: null,
        image: null,

        imageAlt: {
          en: "",
          th: "",
        },
      },

      sections: [],

      updatedAt: null,
      updatedBy: null,

      publishedAt: null,
      publishedBy: null,
    },

    published: null,

    createdAt: null,
    createdBy: null,

    updatedAt: null,
    updatedBy: null,
  };
}

export function serializeAboutPageDocument(snapshot) {
  if (!snapshot?.exists) {
    return createEmptyAboutPage();
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    pageType: data.pageType || ABOUT_PAGE_ID,

    status: data.published
      ? ABOUT_PAGE_STATUSES.PUBLISHED
      : ABOUT_PAGE_STATUSES.DRAFT,

    draftVersion: Number(data.draftVersion || 0),
    publishedVersion: Number(data.publishedVersion || 0),

    draft: serializeAboutContent(data.draft) || createEmptyAboutPage().draft,
    published: serializeAboutContent(data.published),

    createdAt: serializeTimestamp(data.createdAt),
    createdBy: data.createdBy || null,

    updatedAt: serializeTimestamp(data.updatedAt),
    updatedBy: data.updatedBy || null,
  };
}
