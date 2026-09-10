export const ABOUT_PAGE_ID = "about";

export const ABOUT_PAGE_CACHE_TAG = "about-page";

export const ABOUT_PAGE_STATUSES = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
});

export const ABOUT_SECTION_TYPES = Object.freeze({
  HERO: "hero",
  RICH_CONTENT: "rich-content",
  FEATURE_GRID: "feature-grid",
  STATISTICS: "statistics",
  CTA: "cta",
});

export const ABOUT_SECTION_TYPE_VALUES = Object.freeze(
  Object.values(ABOUT_SECTION_TYPES),
);

export const ABOUT_SECTION_LAYOUTS = Object.freeze({
  FULL_WIDTH: "full-width",
  CONTAINED: "contained",
  SPLIT: "split",
  GRID: "grid",
  BANNER: "banner",
});

export const ABOUT_SECTION_LAYOUT_VALUES = Object.freeze(
  Object.values(ABOUT_SECTION_LAYOUTS),
);

export const ABOUT_IMAGE_POSITIONS = Object.freeze({
  NONE: "none",
  LEFT: "left",
  RIGHT: "right",
  BACKGROUND: "background",
});

export const ABOUT_IMAGE_POSITION_VALUES = Object.freeze(
  Object.values(ABOUT_IMAGE_POSITIONS),
);

export const ABOUT_IMAGE_RATIOS = Object.freeze({
  AUTO: "auto",
  LANDSCAPE: "16/9",
  STANDARD: "4/3",
  SQUARE: "1/1",
  PORTRAIT: "3/4",
});

export const ABOUT_IMAGE_RATIO_VALUES = Object.freeze(
  Object.values(ABOUT_IMAGE_RATIOS),
);

export const ABOUT_CONTENT_ALIGNMENTS = Object.freeze({
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
});

export const ABOUT_CONTENT_ALIGNMENT_VALUES = Object.freeze(
  Object.values(ABOUT_CONTENT_ALIGNMENTS),
);

export const ABOUT_BACKGROUND_STYLES = Object.freeze({
  WHITE: "white",
  MUTED: "muted",
  BRAND: "brand",
  DARK: "dark",
});

export const ABOUT_BACKGROUND_STYLE_VALUES = Object.freeze(
  Object.values(ABOUT_BACKGROUND_STYLES),
);

export const ABOUT_BUTTON_STYLES = Object.freeze({
  PRIMARY: "primary",
  SECONDARY: "secondary",
  OUTLINE: "outline",
  LINK: "link",
});

export const ABOUT_BUTTON_STYLE_VALUES = Object.freeze(
  Object.values(ABOUT_BUTTON_STYLES),
);

export const ABOUT_LIMITS = Object.freeze({
  SEO_TITLE_MAX_LENGTH: 120,
  SEO_DESCRIPTION_MAX_LENGTH: 320,

  SECTION_MAX_COUNT: 40,
  SECTION_LABEL_MAX_LENGTH: 120,
  EYEBROW_MAX_LENGTH: 120,
  TITLE_MAX_LENGTH: 240,

  ITEMS_MAX_COUNT: 24,
  ITEM_TITLE_MAX_LENGTH: 180,
  ITEM_VALUE_MAX_LENGTH: 80,
  ITEM_ICON_MAX_LENGTH: 80,

  ACTIONS_MAX_COUNT: 3,
  ACTION_LABEL_MAX_LENGTH: 80,
  ACTION_HREF_MAX_LENGTH: 500,

  MEDIA_ID_MAX_LENGTH: 128,

  SORT_ORDER_MIN: 0,
  SORT_ORDER_MAX: 100000,
});

export const ABOUT_EMPTY_RICH_TEXT = Object.freeze({
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
});

export const ABOUT_SECTION_DEFAULTS = Object.freeze({
  type: ABOUT_SECTION_TYPES.RICH_CONTENT,

  enabled: true,

  internalLabel: {
    en: "",
    th: "",
  },

  eyebrow: {
    en: "",
    th: "",
  },

  title: {
    en: "",
    th: "",
  },

  content: {
    en: ABOUT_EMPTY_RICH_TEXT,
    th: ABOUT_EMPTY_RICH_TEXT,
  },

  imageMediaId: null,

  imageAlt: {
    en: "",
    th: "",
  },

  layout: {
    variant: ABOUT_SECTION_LAYOUTS.SPLIT,
    imagePosition: ABOUT_IMAGE_POSITIONS.RIGHT,
    imageRatio: ABOUT_IMAGE_RATIOS.STANDARD,
    contentAlignment: ABOUT_CONTENT_ALIGNMENTS.LEFT,
    background: ABOUT_BACKGROUND_STYLES.WHITE,
  },

  actions: [],

  items: [],

  sortOrder: 10,
});
