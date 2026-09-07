export const CONTACT_MESSAGE_STATUSES = Object.freeze({
  NEW: "new",
  READ: "read",
  REPLIED: "replied",
  ARCHIVED: "archived",
});

export const CONTACT_MESSAGE_STATUS_VALUES = Object.freeze(
  Object.values(CONTACT_MESSAGE_STATUSES),
);

export const CONTACT_ENQUIRY_TYPES = Object.freeze({
  PRODUCT: "product",
  PROJECT: "project",
  TECHNICAL: "technical",
  PARTNERSHIP: "partnership",
  GENERAL: "general",
});

export const CONTACT_ENQUIRY_TYPE_VALUES = Object.freeze(
  Object.values(CONTACT_ENQUIRY_TYPES),
);

export const CONTACT_PRODUCT_CATEGORIES = Object.freeze({
  DOOR_CLOSERS: "door-closers",
  LEVER_HANDLES: "lever-handles",
  LOCKS_CYLINDERS: "locks-cylinders",
  HINGES: "hinges",
  PANIC_EXIT_HARDWARE: "panic-exit-hardware",
  DOOR_WINDOW_SEALS: "door-window-seals",
  FIRE_DOORS: "fire-doors",
  ELECTRONIC_LOCKS: "electronic-locks",
  OTHER: "other",
});

export const CONTACT_PRODUCT_CATEGORY_VALUES = Object.freeze(
  Object.values(CONTACT_PRODUCT_CATEGORIES),
);
