export const MEDIA_TYPES = Object.freeze({
  IMAGE: "image",
  DOCUMENT: "document",
});

export const MEDIA_STATUSES = Object.freeze({
  UPLOADING: "uploading",
  ACTIVE: "active",
  FAILED: "failed",
  CLEANING: "cleaning",
});

export const MEDIA_FOLDERS = Object.freeze({
  PRODUCTS: "products",
  CATEGORIES: "categories",
  PROJECTS: "projects",
  SOLUTIONS: "solutions",
  PAGES: "pages",
  BRANDING: "branding",

  CATALOGS: "catalogs",
  CERTIFICATES: "certificates",
  TECHNICAL: "technical",
  DOWNLOADS: "downloads",

  TEMPORARY: "temporary",
});

export const MEDIA_TYPE_VALUES = Object.freeze(Object.values(MEDIA_TYPES));

export const MEDIA_STATUS_VALUES = Object.freeze(Object.values(MEDIA_STATUSES));

export const MEDIA_FOLDER_VALUES = Object.freeze(Object.values(MEDIA_FOLDERS));

export const MEDIA_IMAGE_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const MEDIA_DOCUMENT_MIME_TYPES = Object.freeze([
  "application/pdf",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "text/csv",
]);

export const MEDIA_ALLOWED_MIME_TYPES = Object.freeze([
  ...MEDIA_IMAGE_MIME_TYPES,
  ...MEDIA_DOCUMENT_MIME_TYPES,
]);

export const MEDIA_FILE_EXTENSIONS = Object.freeze({
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",

  "application/pdf": "pdf",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",

  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",

  "text/csv": "csv",
});

export const MEDIA_LIMITS = Object.freeze({
  IMAGE_MAX_BYTES: 10 * 1024 * 1024,
  DOCUMENT_MAX_BYTES: 30 * 1024 * 1024,

  ORIGINAL_NAME_MAX_LENGTH: 180,
  TITLE_MAX_LENGTH: 160,
  ALT_TEXT_MAX_LENGTH: 180,
  CAPTION_MAX_LENGTH: 500,

  SEARCH_MAX_LENGTH: 120,
  KEYWORD_MAX_LENGTH: 80,
  KEYWORDS_MAX_ITEMS: 20,

  LIST_DEFAULT_LIMIT: 24,
  LIST_MAX_LIMIT: 100,

  SIGNED_UPLOAD_EXPIRES_MINUTES: 15,
  INCOMPLETE_UPLOAD_RETENTION_HOURS: 24,
});

export const MEDIA_STORAGE_ROOT = "media";

export const MEDIA_DOCUMENT_FOLDERS = Object.freeze([
  MEDIA_FOLDERS.CATALOGS,
  MEDIA_FOLDERS.CERTIFICATES,
  MEDIA_FOLDERS.TECHNICAL,
  MEDIA_FOLDERS.DOWNLOADS,
  MEDIA_FOLDERS.TEMPORARY,
]);

export const MEDIA_IMAGE_FOLDERS = Object.freeze([
  MEDIA_FOLDERS.PRODUCTS,
  MEDIA_FOLDERS.CATEGORIES,
  MEDIA_FOLDERS.PROJECTS,
  MEDIA_FOLDERS.SOLUTIONS,
  MEDIA_FOLDERS.PAGES,
  MEDIA_FOLDERS.BRANDING,
  MEDIA_FOLDERS.TEMPORARY,
]);

export function getMediaTypeFromMimeType(mimeType) {
  if (MEDIA_IMAGE_MIME_TYPES.includes(mimeType)) {
    return MEDIA_TYPES.IMAGE;
  }

  if (MEDIA_DOCUMENT_MIME_TYPES.includes(mimeType)) {
    return MEDIA_TYPES.DOCUMENT;
  }

  return null;
}

export function getMediaExtension(mimeType) {
  return MEDIA_FILE_EXTENSIONS[mimeType] || null;
}

export function getMediaMaxBytes(mediaType) {
  if (mediaType === MEDIA_TYPES.IMAGE) {
    return MEDIA_LIMITS.IMAGE_MAX_BYTES;
  }

  if (mediaType === MEDIA_TYPES.DOCUMENT) {
    return MEDIA_LIMITS.DOCUMENT_MAX_BYTES;
  }

  return 0;
}

export function isAllowedMediaMimeType(mimeType) {
  return MEDIA_ALLOWED_MIME_TYPES.includes(mimeType);
}

export function isFolderAllowedForMediaType(folder, mediaType) {
  if (mediaType === MEDIA_TYPES.IMAGE) {
    return MEDIA_IMAGE_FOLDERS.includes(folder);
  }

  if (mediaType === MEDIA_TYPES.DOCUMENT) {
    return MEDIA_DOCUMENT_FOLDERS.includes(folder);
  }

  return false;
}
