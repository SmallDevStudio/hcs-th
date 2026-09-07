export const HOME_SECTION_TYPES = Object.freeze({
  HERO_SLIDE: "hero-slide",
});

export const HOME_SECTION_TYPE_VALUES = Object.freeze(
  Object.values(HOME_SECTION_TYPES),
);

export const HOME_SECTION_STATUSES = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
});

export const HOME_SECTION_STATUS_VALUES = Object.freeze(
  Object.values(HOME_SECTION_STATUSES),
);

export const HOME_HERO_DEFAULTS = Object.freeze({
  sectionType: HOME_SECTION_TYPES.HERO_SLIDE,

  eyebrow: {
    en: "",
    th: "",
  },

  titleLineOne: {
    en: "",
    th: "",
  },

  titleLineTwo: {
    en: "",
    th: "",
  },

  description: {
    en: "",
    th: "",
  },

  primaryAction: {
    label: {
      en: "",
      th: "",
    },

    href: "/products",
  },

  secondaryAction: {
    label: {
      en: "",
      th: "",
    },

    href: "/contact",
  },

  desktopImageMediaId: null,
  mobileImageMediaId: null,

  status: HOME_SECTION_STATUSES.DRAFT,

  sortOrder: 10,

  displaySchedule: {
    startsAt: null,
    endsAt: null,
  },
});

export const HOME_HERO_LIMITS = Object.freeze({
  EYEBROW_MAX_LENGTH: 100,

  TITLE_LINE_MAX_LENGTH: 100,

  DESCRIPTION_MAX_LENGTH: 500,

  ACTION_LABEL_MAX_LENGTH: 80,

  ACTION_HREF_MAX_LENGTH: 500,

  SORT_ORDER_MIN: 0,

  SORT_ORDER_MAX: 100000,

  LIST_DEFAULT_LIMIT: 25,

  LIST_MAX_LIMIT: 100,
});

export const HOME_HERO_CACHE_TAG = "home-hero-slides";
