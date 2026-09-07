import { CACHE_TAGS } from "@/constants/cache-tags";

export const STANDARD_CACHE_TAG = CACHE_TAGS.STANDARDS || "standards";

export const STANDARD_STATUSES = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
  INACTIVE: "inactive",
});

export const STANDARD_STATUS_VALUES = Object.freeze(
  Object.values(STANDARD_STATUSES),
);

export const STANDARD_DOCUMENT_TYPES = Object.freeze({
  CERTIFICATE: "certificate",
  TEST_REPORT: "test-report",
  DECLARATION_OF_PERFORMANCE: "declaration-of-performance",
  PRODUCT_COMPLIANCE: "product-compliance",
  QUALITY_CERTIFICATE: "quality-certificate",
  TECHNICAL_DOCUMENT: "technical-document",
  OTHER: "other",
});

export const STANDARD_DOCUMENT_TYPE_VALUES = Object.freeze(
  Object.values(STANDARD_DOCUMENT_TYPES),
);

export const STANDARD_LANGUAGES = Object.freeze({
  ENGLISH: "en",
  THAI: "th",
  BILINGUAL: "bilingual",
  OTHER: "other",
});

export const STANDARD_LANGUAGE_VALUES = Object.freeze(
  Object.values(STANDARD_LANGUAGES),
);

export const STANDARD_LIMITS = Object.freeze({
  CODE_MAX_LENGTH: 40,
  SLUG_MAX_LENGTH: 128,

  NAME_MAX_LENGTH: 180,

  SHORT_DESCRIPTION_MAX_LENGTH: 400,
  DESCRIPTION_MAX_LENGTH: 6000,

  CLASSIFICATION_MAX_LENGTH: 240,
  CONFORMITY_REFERENCE_MAX_LENGTH: 240,
  ISSUER_MAX_LENGTH: 180,

  CATEGORY_IDS_MAX_ITEMS: 40,
  PRODUCT_IDS_MAX_ITEMS: 200,

  SEO_TITLE_MAX_LENGTH: 70,
  SEO_DESCRIPTION_MAX_LENGTH: 180,

  KEYWORD_MAX_LENGTH: 80,
  KEYWORDS_MAX_ITEMS: 20,

  QUERY_LIMIT_DEFAULT: 25,
  QUERY_LIMIT_MAX: 100,

  SORT_ORDER_MIN: 0,
  SORT_ORDER_MAX: 999999,

  SEARCH_MAX_LENGTH: 160,
});

export const STANDARD_DEFAULTS = Object.freeze({
  code: "",

  slug: "",

  name: {
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

  classification: {
    en: "",
    th: "",
  },

  conformityReference: "",

  issuer: {
    en: "",
    th: "",
  },

  documentType: STANDARD_DOCUMENT_TYPES.CERTIFICATE,

  documentLanguage: STANDARD_LANGUAGES.ENGLISH,

  documentMediaId: null,

  relatedCategoryIds: [],
  relatedProductIds: [],

  issueDate: null,
  expiryDate: null,

  status: STANDARD_STATUSES.DRAFT,

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

export function normalizeStandardSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .trim()
    .toLocaleLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidStandardSlug(value) {
  return (
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= STANDARD_LIMITS.SLUG_MAX_LENGTH &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  );
}

export function normalizeStandardCode(value) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleUpperCase();
}

export function createStandardKey(value) {
  return normalizeStandardCode(value)
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLocaleLowerCase();
}
