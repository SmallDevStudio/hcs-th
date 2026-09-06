export const PRODUCT_CACHE_TAG = "products";

export const PRODUCT_STATUSES = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
  INACTIVE: "inactive",
});

export const PRODUCT_STATUS_VALUES = Object.freeze(
  Object.values(PRODUCT_STATUSES),
);

export const PRODUCT_LIMITS = Object.freeze({
  NAME_MAX_LENGTH: 160,

  SLUG_MIN_LENGTH: 2,
  SLUG_MAX_LENGTH: 180,

  MODEL_MAX_LENGTH: 100,
  SKU_MAX_LENGTH: 100,

  PRODUCT_TYPE_MAX_LENGTH: 120,

  PRODUCT_TYPE_SLUG_MIN_LENGTH: 2,
  PRODUCT_TYPE_SLUG_MAX_LENGTH: 140,

  SERIES_MAX_LENGTH: 160,

  SHORT_DESCRIPTION_MAX_LENGTH: 300,

  DESCRIPTION_MAX_LENGTH: 20000,

  FEATURE_MAX_LENGTH: 500,
  FEATURES_MAX_ITEMS: 30,

  VARIATION_MAX_LENGTH: 500,
  VARIATIONS_MAX_ITEMS: 30,

  SPECIFICATION_LABEL_MAX_LENGTH: 160,

  SPECIFICATION_VALUE_MAX_LENGTH: 1000,

  SPECIFICATIONS_MAX_ITEMS: 80,

  FINISH_CODE_MAX_LENGTH: 30,
  FINISH_NAME_MAX_LENGTH: 120,
  FINISHES_MAX_ITEMS: 40,

  STANDARD_NAME_MAX_LENGTH: 100,

  STANDARD_CLASSIFICATION_MAX_LENGTH: 200,

  CONFORMITY_REFERENCE_MAX_LENGTH: 160,

  STANDARDS_MAX_ITEMS: 40,

  GALLERY_MAX_ITEMS: 12,
  DOCUMENTS_MAX_ITEMS: 12,

  SEO_TITLE_MAX_LENGTH: 70,

  SEO_DESCRIPTION_MAX_LENGTH: 180,

  KEYWORD_MAX_LENGTH: 80,
  KEYWORDS_MAX_ITEMS: 20,

  SORT_ORDER_MIN: 0,
  SORT_ORDER_MAX: 999999,

  LIST_DEFAULT_LIMIT: 25,
  LIST_MAX_LIMIT: 100,
});

export const PRODUCT_DEFAULTS = Object.freeze({
  model: "",
  sku: "",

  productTypeSlug: "",

  fireRated: false,

  status: PRODUCT_STATUSES.DRAFT,

  featured: false,
  showOnHome: false,

  sortOrder: 0,

  primaryImageMediaId: null,

  galleryMediaIds: [],
  documentMediaIds: [],

  specifications: [],
  finishes: [],
  standards: [],
});

export function normalizeProductSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .trim()
    .toLocaleLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidProductSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ""));
}

export function normalizeProductTypeSlug(value) {
  return normalizeProductSlug(value);
}

export function isValidProductTypeSlug(value) {
  if (!value) {
    return true;
  }

  return isValidProductSlug(value);
}
