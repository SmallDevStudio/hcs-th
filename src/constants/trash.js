import { COLLECTIONS } from "@/constants/collections";

export const TRASH_ENTITY_COLLECTIONS = Object.freeze({
  page: COLLECTIONS.PAGES,
  category: COLLECTIONS.CATEGORIES,
  product: COLLECTIONS.PRODUCTS,
  solution: COLLECTIONS.SOLUTIONS,
  project: COLLECTIONS.PROJECTS,
  standard: COLLECTIONS.STANDARDS,
  download: COLLECTIONS.DOWNLOADS,
  media: COLLECTIONS.MEDIA,
  message: COLLECTIONS.CONTACT_MESSAGES,
});

export const TRASH_ENTITY_TYPES = Object.freeze(
  Object.keys(TRASH_ENTITY_COLLECTIONS),
);

export const TRASH_RETENTION_DAYS = 30;

export function getTrashCollection(entityType) {
  return TRASH_ENTITY_COLLECTIONS[entityType] || null;
}

export function isTrashEntityType(entityType) {
  return TRASH_ENTITY_TYPES.includes(entityType);
}
