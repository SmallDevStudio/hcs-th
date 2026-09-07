const solutionsEn = {
  eyebrow: "Solution Management",

  title: "Solutions",

  description:
    "Manage bilingual solution content, images, display settings and search engine information.",

  actions: {
    create: "Add Solution",
    edit: "Edit Solution",
    delete: "Move to Trash",
    refresh: "Refresh",
    search: "Search",
    clear: "Clear filters",
    close: "Close",
    cancel: "Cancel",
    save: "Save Solution",
    saving: "Saving...",
    saveOrder: "Save Order",
    selectImage: "Select Image",
    changeImage: "Change Image",
    removeImage: "Remove Image",
    addFeature: "Add Feature",
    removeFeature: "Remove",
    generateSlug: "Generate Slug",
    loadMore: "Load More",
    loadingMore: "Loading...",
  },

  filters: {
    search: "Search solutions",

    searchPlaceholder: "Search by solution name, title or keyword...",

    status: "Status",

    allStatuses: "All statuses",

    featured: "Featured",

    allFeatured: "All solutions",

    featuredOnly: "Featured only",

    nonFeaturedOnly: "Not featured",

    home: "Home page",

    allHome: "All solutions",

    showOnHomeOnly: "Shown on Home",

    hiddenFromHomeOnly: "Hidden from Home",
  },

  statuses: {
    draft: "Draft",

    published: "Published",

    inactive: "Inactive",
  },

  icons: {
    hospitality: "Hospitality",

    healthcare: "Healthcare",

    commercial: "Commercial",

    industrial: "Industrial",

    building: "Building",

    security: "Security",

    fireRated: "Fire-rated",

    accessControl: "Access Control",
  },

  table: {
    solution: "Solution",

    icon: "Icon",

    status: "Status",

    featured: "Featured",

    home: "Home",

    order: "Order",

    updated: "Last Updated",

    actions: "Actions",
  },

  badges: {
    featured: "Featured",

    showOnHome: "Show on Home",

    noImage: "No image",
  },

  form: {
    createEyebrow: "New Solution",

    createTitle: "Add Solution",

    createDescription:
      "Enter bilingual content and choose the image used for this solution.",

    editEyebrow: "Solution Details",

    editTitle: "Edit Solution",

    editDescription:
      "Update solution content, image, publishing settings and SEO.",

    basicSection: "Basic Information",

    contentSection: "Solution Content",

    featuresSection: "Key Features",

    mediaSection: "Solution Image",

    displaySection: "Publishing and Display",

    seoSection: "Search Engine Optimization",

    emptyFeatures: "No key features have been added.",
  },

  fields: {
    name: "Solution Name",

    slug: "URL Slug",

    slugHint: "Lowercase letters, numbers and hyphens only.",

    eyebrow: "Eyebrow Text",

    icon: "Solution Icon",

    shortDescription: "Short Description",

    description: "Full Description",

    features: "Key Features",

    feature: "Feature",

    image: "Main Solution Image",

    imageHint:
      "Select one landscape image from the Media Library or upload a new image.",

    status: "Status",

    featured: "Featured solution",

    showOnHome: "Show on Home page",

    sortOrder: "Display Order",

    seoTitle: "SEO Title",

    seoDescription: "SEO Description",

    seoKeywords: "SEO Keywords",

    seoKeywordsHint: "Separate keywords with commas.",
  },

  placeholders: {
    nameEn: "Healthcare",

    nameTh: "โรงพยาบาล",

    slug: "healthcare",

    eyebrowEn: "Solutions by Building Type",

    eyebrowTh: "โซลูชันตามประเภทอาคาร",

    shortDescriptionEn:
      "Safe and reliable opening solutions for healthcare environments.",

    shortDescriptionTh:
      "โซลูชันระบบประตูที่ปลอดภัยและไว้วางใจได้สำหรับสถานพยาบาล",

    descriptionEn:
      "Complete door opening and access solutions designed for hospitals and healthcare facilities.",

    descriptionTh:
      "โซลูชันระบบประตูและการควบคุมการเข้าออกครบวงจรสำหรับโรงพยาบาลและสถานพยาบาล",

    featureEn: "Hygienic and easy-to-clean hardware",

    featureTh: "อุปกรณ์ที่ถูกสุขลักษณะและทำความสะอาดง่าย",

    seoTitleEn: "Healthcare Door Solutions",

    seoTitleTh: "โซลูชันระบบประตูสำหรับโรงพยาบาล",
  },

  mediaPicker: {
    eyebrow: "Solution Image",

    title: "Select Solution Image",

    description:
      "Choose an existing image or upload a new image for this solution.",

    search: "Search",

    searchPlaceholder: "Search solution images...",

    selected: "Selected {{count}} / {{maximum}}",

    loading: "Loading media files...",

    empty: "No images found.",

    loadMore: "Load More",

    cancel: "Cancel",

    useImage: "Use Image",

    selectionHint: "Select one image to continue.",
  },

  confirmDelete: {
    title: "Move this solution to trash?",

    text: "The solution can be restored later. Its media usage will be released.",

    confirm: "Move to Trash",

    cancel: "Cancel",
  },

  messages: {
    loadFailed: "Unable to load solutions.",

    createSuccess: "Solution created successfully.",

    createFailed: "Unable to create the solution.",

    updateSuccess: "Solution updated successfully.",

    updateFailed: "Unable to update the solution.",

    deleteSuccess: "Solution moved to trash successfully.",

    deleteFailed: "Unable to move the solution to trash.",

    orderSuccess: "Solution order saved successfully.",

    orderFailed: "Unable to save solution order.",

    slugExists: "This solution slug is already in use.",

    mediaLoadFailed: "Unable to load media files.",

    publishIncomplete:
      "Complete both languages and select a main image before publishing.",
  },

  empty: {
    title: "No solutions found",

    description: "Add the first solution to begin building the Solutions page.",

    filteredDescription: "No solutions match the selected filters.",
  },
};

export default solutionsEn;
