export const SOLUTION_CACHE_TAG = "solutions";

export const SOLUTION_STATUSES = Object.freeze({
  DRAFT: "draft",

  PUBLISHED: "published",
});

export const SOLUTION_STATUS_VALUES = Object.freeze(
  Object.values(SOLUTION_STATUSES),
);

export const SOLUTION_ICONS = Object.freeze({
  HOSPITALITY: "hospitality",

  HEALTHCARE: "healthcare",

  COMMERCIAL: "commercial",

  INDUSTRIAL: "industrial",

  BUILDING: "building",

  SECURITY: "security",

  FIRE_RATED: "fire-rated",

  ACCESS_CONTROL: "access-control",
});

export const SOLUTION_ICON_VALUES = Object.freeze(
  Object.values(SOLUTION_ICONS),
);

export const SOLUTION_LIMITS = Object.freeze({
  NAME_MAX_LENGTH: 160,

  SLUG_MIN_LENGTH: 2,

  SLUG_MAX_LENGTH: 160,

  EYEBROW_MAX_LENGTH: 100,

  SHORT_DESCRIPTION_MAX_LENGTH: 320,

  DESCRIPTION_MAX_LENGTH: 10000,

  FEATURES_MAX_ITEMS: 20,

  FEATURE_MAX_LENGTH: 500,

  SEO_TITLE_MAX_LENGTH: 70,

  SEO_DESCRIPTION_MAX_LENGTH: 180,

  KEYWORDS_MAX_ITEMS: 20,

  KEYWORD_MAX_LENGTH: 100,

  SORT_ORDER_MIN: 0,

  SORT_ORDER_MAX: 999999,

  LIST_DEFAULT_LIMIT: 25,

  LIST_MAX_LIMIT: 100,
});

export const SOLUTION_DEFAULTS = Object.freeze({
  eyebrow: {
    en: "",

    th: "",
  },

  shortDescription: {
    en: "",

    th: "",
  },

  description: {
    en: "",

    th: "",
  },

  icon: SOLUTION_ICONS.BUILDING,

  imageMediaId: null,

  features: {
    en: [],

    th: [],
  },

  status: SOLUTION_STATUSES.DRAFT,

  featured: false,

  showOnHome: false,

  sortOrder: 0,

  seo: {
    title: {
      en: "",

      th: "",
    },

    description: {
      en: "",

      th: "",
    },

    keywords: {
      en: [],

      th: [],
    },
  },
});

export function normalizeSolutionSlug(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidSolutionSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ""));
}
