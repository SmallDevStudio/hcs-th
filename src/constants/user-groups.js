export const USER_GROUP_STATUSES = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

export const USER_GROUP_STATUS_VALUES = Object.freeze(
  Object.values(USER_GROUP_STATUSES),
);

export const USER_GROUP_DEFAULTS = Object.freeze({
  name: "",
  description: "",

  permissions: [],

  status: USER_GROUP_STATUSES.ACTIVE,
});

export const USER_GROUP_LIMITS = Object.freeze({
  NAME_MAX_LENGTH: 120,

  DESCRIPTION_MAX_LENGTH: 500,

  LIST_DEFAULT_LIMIT: 25,

  LIST_MAX_LIMIT: 100,

  SEARCH_MAX_LENGTH: 120,
});
