export const PROJECT_CACHE_TAG = "projects";

export const PROJECT_STATUSES = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
});

export const PROJECT_STATUS_VALUES = Object.freeze(
  Object.values(PROJECT_STATUSES),
);

export const PROJECT_BUILDING_TYPES = Object.freeze({
  HOSPITALITY: "hospitality",
  HEALTHCARE: "healthcare",
  COMMERCIAL: "commercial",
  INDUSTRIAL: "industrial",
  RESIDENTIAL: "residential",
  EDUCATION: "education",
  GOVERNMENT: "government",
  RETAIL: "retail",
  TRANSPORTATION: "transportation",
  MIXED_USE: "mixed-use",
  OTHER: "other",
});

export const PROJECT_BUILDING_TYPE_VALUES = Object.freeze(
  Object.values(PROJECT_BUILDING_TYPES),
);

export const PROJECT_LIMITS = Object.freeze({
  NAME_MAX_LENGTH: 200,

  SLUG_MIN_LENGTH: 2,
  SLUG_MAX_LENGTH: 200,

  LOCATION_MAX_LENGTH: 200,
  CLIENT_MAX_LENGTH: 200,

  SHORT_DESCRIPTION_MAX_LENGTH: 400,
  DESCRIPTION_MAX_LENGTH: 15000,

  RESULTS_MAX_ITEMS: 20,
  RESULT_MAX_LENGTH: 500,

  GALLERY_MAX_ITEMS: 20,

  RELATED_PRODUCTS_MAX_ITEMS: 30,
  RELATED_SOLUTIONS_MAX_ITEMS: 20,

  YEAR_MIN: 1900,
  YEAR_MAX: 2200,

  SEO_TITLE_MAX_LENGTH: 70,
  SEO_DESCRIPTION_MAX_LENGTH: 180,

  KEYWORDS_MAX_ITEMS: 20,
  KEYWORD_MAX_LENGTH: 100,

  SORT_ORDER_MIN: 0,
  SORT_ORDER_MAX: 999999,

  LIST_DEFAULT_LIMIT: 25,
  LIST_MAX_LIMIT: 100,
});

export const PROJECT_DEFAULTS = Object.freeze({
  buildingType: PROJECT_BUILDING_TYPES.OTHER,

  location: {
    en: "",
    th: "",
  },

  client: {
    en: "",
    th: "",
  },

  year: null,

  shortDescription: {
    en: "",
    th: "",
  },

  description: {
    en: "",
    th: "",
  },

  challenge: {
    en: "",
    th: "",
  },

  solution: {
    en: "",
    th: "",
  },

  results: {
    en: [],
    th: [],
  },

  coverImageMediaId: null,

  galleryMediaIds: [],

  relatedProductIds: [],

  relatedSolutionIds: [],

  status: PROJECT_STATUSES.DRAFT,

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

export function normalizeProjectSlug(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidProjectSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ""));
}
