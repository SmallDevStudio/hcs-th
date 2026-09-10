import {
  ABOUT_BACKGROUND_STYLES,
  ABOUT_BUTTON_STYLES,
  ABOUT_CONTENT_ALIGNMENTS,
  ABOUT_EMPTY_RICH_TEXT,
  ABOUT_IMAGE_POSITIONS,
  ABOUT_IMAGE_RATIOS,
  ABOUT_SECTION_LAYOUTS,
  ABOUT_SECTION_TYPES,
} from "@/constants/about";

function createId(prefix) {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return [
    prefix,
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 10),
  ].join("-");
}

export function createLocalizedText(en = "", th = "") {
  return {
    en,
    th,
  };
}

export function createLocalizedRichText() {
  return {
    en: structuredClone(ABOUT_EMPTY_RICH_TEXT),
    th: structuredClone(ABOUT_EMPTY_RICH_TEXT),
  };
}

export function createAboutAction({
  label,
  href = "",
  style = ABOUT_BUTTON_STYLES.PRIMARY,
  openInNewTab = false,
} = {}) {
  return {
    id: createId("action"),

    label: {
      ...createLocalizedText(),
      ...label,
    },

    href,

    style,

    openInNewTab,
  };
}

export function createAboutItem({
  title,
  value,
  icon = "",
  imageMediaId = null,
  imageAlt,
  sortOrder = 10,
} = {}) {
  return {
    id: createId("item"),

    title: {
      ...createLocalizedText(),
      ...title,
    },

    content: createLocalizedRichText(),

    value: {
      ...createLocalizedText(),
      ...value,
    },

    icon,

    imageMediaId,

    imageAlt: {
      ...createLocalizedText(),
      ...imageAlt,
    },

    sortOrder,
  };
}

function createSectionLayout(type) {
  if (type === ABOUT_SECTION_TYPES.HERO) {
    return {
      variant: ABOUT_SECTION_LAYOUTS.FULL_WIDTH,
      imagePosition: ABOUT_IMAGE_POSITIONS.NONE,
      imageRatio: ABOUT_IMAGE_RATIOS.LANDSCAPE,
      contentAlignment: ABOUT_CONTENT_ALIGNMENTS.CENTER,
      background: ABOUT_BACKGROUND_STYLES.DARK,
    };
  }

  if (type === ABOUT_SECTION_TYPES.FEATURE_GRID) {
    return {
      variant: ABOUT_SECTION_LAYOUTS.GRID,
      imagePosition: ABOUT_IMAGE_POSITIONS.NONE,
      imageRatio: ABOUT_IMAGE_RATIOS.STANDARD,
      contentAlignment: ABOUT_CONTENT_ALIGNMENTS.LEFT,
      background: ABOUT_BACKGROUND_STYLES.WHITE,
    };
  }

  if (type === ABOUT_SECTION_TYPES.STATISTICS) {
    return {
      variant: ABOUT_SECTION_LAYOUTS.GRID,
      imagePosition: ABOUT_IMAGE_POSITIONS.NONE,
      imageRatio: ABOUT_IMAGE_RATIOS.AUTO,
      contentAlignment: ABOUT_CONTENT_ALIGNMENTS.CENTER,
      background: ABOUT_BACKGROUND_STYLES.BRAND,
    };
  }

  if (type === ABOUT_SECTION_TYPES.CTA) {
    return {
      variant: ABOUT_SECTION_LAYOUTS.BANNER,
      imagePosition: ABOUT_IMAGE_POSITIONS.NONE,
      imageRatio: ABOUT_IMAGE_RATIOS.LANDSCAPE,
      contentAlignment: ABOUT_CONTENT_ALIGNMENTS.CENTER,
      background: ABOUT_BACKGROUND_STYLES.BRAND,
    };
  }

  return {
    variant: ABOUT_SECTION_LAYOUTS.SPLIT,
    imagePosition: ABOUT_IMAGE_POSITIONS.NONE,
    imageRatio: ABOUT_IMAGE_RATIOS.STANDARD,
    contentAlignment: ABOUT_CONTENT_ALIGNMENTS.LEFT,
    background: ABOUT_BACKGROUND_STYLES.WHITE,
  };
}

function createInitialItems(type) {
  if (
    type !== ABOUT_SECTION_TYPES.FEATURE_GRID &&
    type !== ABOUT_SECTION_TYPES.STATISTICS
  ) {
    return [];
  }

  return [
    createAboutItem({
      sortOrder: 10,
    }),
  ];
}

export function createAboutSection({
  type = ABOUT_SECTION_TYPES.RICH_CONTENT,
  sortOrder = 10,
} = {}) {
  return {
    id: createId("section"),

    type,

    enabled: true,

    internalLabel: createLocalizedText(),

    eyebrow: createLocalizedText(),

    title: createLocalizedText(),

    content: createLocalizedRichText(),

    imageMediaId: null,

    imageAlt: createLocalizedText(),

    layout: createSectionLayout(type),

    actions: [],

    items: createInitialItems(type),

    sortOrder,
  };
}

export function createAboutDraft() {
  return {
    seo: {
      title: createLocalizedText(),

      description: createLocalizedText(),

      imageMediaId: null,

      imageAlt: createLocalizedText(),
    },

    sections: [],
  };
}

export function cloneAboutDraft(draft) {
  return structuredClone(draft || createAboutDraft());
}

export function normalizeAboutSortOrders(draft) {
  const nextDraft = cloneAboutDraft(draft);

  nextDraft.sections = nextDraft.sections.map((section, sectionIndex) => ({
    ...section,

    sortOrder: (sectionIndex + 1) * 10,

    items: (Array.isArray(section.items) ? section.items : []).map(
      (item, itemIndex) => ({
        ...item,

        sortOrder: (itemIndex + 1) * 10,
      }),
    ),
  }));

  return nextDraft;
}
