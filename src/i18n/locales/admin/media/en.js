const mediaEn = {
  eyebrow: "Media Management",
  title: "Media Library",
  description:
    "Upload and manage images, documents and downloadable files used throughout the HCS Thailand website.",

  summary: {
    showing: "Showing {{count}} files",
    selected: "{{count}} files selected",
  },

  actions: {
    upload: "Upload Files",
    uploading: "Uploading...",
    refresh: "Refresh",
    edit: "Edit Details",
    delete: "Move to Trash",
    download: "Download",
    copyUrl: "Copy URL",
    select: "Select",
    close: "Close",
    save: "Save Changes",
    saving: "Saving...",
    loadMore: "Load More",
    loading: "Loading...",
    clear: "Clear Filters",
    retry: "Try Again",
  },

  views: {
    grid: "Grid view",
    list: "List view",
  },

  filters: {
    search: "Search files",
    searchPlaceholder: "Search by file name, title or keyword...",
    type: "File type",
    folder: "Folder",
    usage: "Usage",
    allTypes: "All file types",
    allFolders: "All folders",
    allUsage: "All files",
  },

  types: {
    image: "Images",
    document: "Documents",
  },

  usage: {
    all: "All files",
    used: "In use",
    unused: "Not in use",
  },

  statuses: {
    uploading: "Uploading",
    active: "Ready",
    failed: "Failed",
  },

  folders: {
    products: "Products",
    categories: "Product Categories",
    projects: "Projects",
    solutions: "Solutions",
    pages: "Website Pages",
    branding: "Branding",
    catalogs: "Catalogs",
    certificates: "Certificates",
    technical: "Technical Documents",
    downloads: "Downloads",
    temporary: "Temporary",
  },

  table: {
    file: "File",
    type: "Type",
    folder: "Folder",
    size: "Size",
    usage: "Usage",
    updatedAt: "Updated",
    actions: "Actions",
  },

  card: {
    unnamed: "Untitled file",
    used: "Used {{count}} times",
    unused: "Not in use",
    imagePreview: "Preview of {{name}}",
    documentPreview: "{{type}} document",
  },

  empty: {
    title: "No media files",
    description:
      "Upload your first image or document to start building the media library.",
    filteredTitle: "No matching files",
    filteredDescription:
      "Try changing the search text or removing some filters.",
  },

  upload: {
    eyebrow: "Add Media",
    title: "Upload Files",
    description:
      "Select images or documents. Files will be uploaded securely to Firebase Storage.",

    dropTitle: "Drop files here",
    dropDescription: "or click to select files from your computer",
    dropActive: "Release to add the files",
    selectFiles: "Select Files",

    acceptedImages: "JPG, PNG, WebP or AVIF up to 10 MB",
    acceptedDocuments: "PDF, DOCX, XLSX, PPTX or CSV up to 30 MB",

    selectedFiles: "Selected Files",
    destinationFolder: "Destination Folder",
    removeFile: "Remove file",

    progress: "{{percentage}}% uploaded",
    completedCount: "{{completed}} of {{total}} files completed",

    stages: {
      waiting: "Waiting",
      preparing: "Preparing",
      uploading: "Uploading",
      processing: "Processing",
      completed: "Completed",
      failed: "Failed",
    },
  },

  edit: {
    eyebrow: "Media Details",
    title: "Edit Media",
    description:
      "Add titles, alternative text and search information for both website languages.",

    originalName: "Original file name",
    storagePath: "Storage path",
    fileInformation: "File Information",

    titleField: "Title",
    altText: "Alternative text",
    caption: "Caption",
    keywords: "Search keywords",

    english: "English",
    thai: "Thai",

    titlePlaceholder: "Enter a descriptive title",
    altPlaceholder: "Describe the image for accessibility and SEO",
    captionPlaceholder: "Optional caption shown with the media",
    keywordsPlaceholder: "door closer, hardware, entrance",

    keywordsHelp: "Separate keywords with commas.",
    imageAltHelp:
      "Describe the visual content clearly. Avoid phrases such as “image of”.",
  },

  confirmDelete: {
    title: "Move this file to trash?",
    text: "The file can be restored later. Files currently used by website content cannot be deleted.",
    confirm: "Move to Trash",
    cancel: "Cancel",
  },

  messages: {
    loadFailed: "Unable to load media files.",
    uploadComplete: "Files uploaded successfully.",
    uploadPartial:
      "Some files could not be uploaded. Check the failed items and try again.",
    uploadFailed: "Unable to upload the file.",
    updateSuccess: "Media details updated.",
    updateFailed: "Unable to update media details.",
    deleteSuccess: "Media file moved to trash.",
    deleteFailed: "Unable to move the media file to trash.",
    copied: "Media URL copied.",
    copyFailed: "Unable to copy the media URL.",
    invalidFile: "{{name}} is not a supported file.",
    imageTooLarge: "{{name}} exceeds the 10 MB image limit.",
    documentTooLarge: "{{name}} exceeds the 30 MB document limit.",
    duplicateFile: "{{name}} has already been selected.",
  },

  pagination: {
    showing: "Showing {{count}} files",
    end: "All media files have been loaded",
  },
};

export default mediaEn;
