export const CATEGORY_STATUSES = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

export const CATEGORY_STATUS_VALUES = Object.freeze(
  Object.values(CATEGORY_STATUSES),
);

export const CATEGORY_ICONS = Object.freeze({
  DOOR_CLOSER: "doorCloser",
  LEVER_HANDLE: "leverHandle",
  LOCK: "lock",
  HINGE: "hinge",
  EXIT: "exit",
  SEAL: "seal",
  FIRE: "fire",
  ELECTRONIC_LOCK: "electronicLock",
  DOOR: "door",
});

export const CATEGORY_ICON_VALUES = Object.freeze(
  Object.values(CATEGORY_ICONS),
);

export const CATEGORY_LIMITS = Object.freeze({
  NAME_MAX_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 500,

  SLUG_MIN_LENGTH: 2,
  SLUG_MAX_LENGTH: 120,

  SEO_TITLE_MAX_LENGTH: 70,
  SEO_DESCRIPTION_MAX_LENGTH: 180,

  KEYWORD_MAX_LENGTH: 80,
  KEYWORDS_MAX_ITEMS: 20,

  SORT_ORDER_MIN: 0,
  SORT_ORDER_MAX: 9999,

  LIST_DEFAULT_LIMIT: 25,
  LIST_MAX_LIMIT: 100,
});

export const CATEGORY_DEFAULTS = Object.freeze({
  icon: CATEGORY_ICONS.DOOR,
  status: CATEGORY_STATUSES.ACTIVE,

  featured: false,
  showOnHome: true,

  sortOrder: 0,

  imageMediaId: null,
});

export function normalizeCategorySlug(value = "") {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidCategorySlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export const CATEGORY_CACHE_TAG = "categories";
