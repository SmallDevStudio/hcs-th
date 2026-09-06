const categoriesEn = {
  eyebrow: "Product Management",
  title: "Product Categories",
  description:
    "Manage product groups, images, display order and SEO information used throughout the website.",

  actions: {
    create: "Add Category",
    edit: "Edit Category",
    delete: "Move to Trash",
    save: "Save Category",
    saving: "Saving...",
    cancel: "Cancel",
    close: "Close",
    refresh: "Refresh",
    search: "Search",
    clear: "Clear Filters",
    loadMore: "Load More",
    loading: "Loading...",
    selectImage: "Select Image",
    changeImage: "Change Image",
    removeImage: "Remove Image",
    generateSlug: "Generate Slug",
    saveOrder: "Save Order",
  },

  filters: {
    search: "Search categories",
    searchPlaceholder: "Search by category name or slug...",
    status: "Status",
    allStatuses: "All statuses",
  },

  statuses: {
    active: "Active",
    inactive: "Inactive",
  },

  fields: {
    name: "Category Name",
    description: "Description",
    slug: "URL Slug",
    slugHint: "Lowercase English letters, numbers and hyphens only.",
    icon: "Category Icon",
    image: "Category Image",
    imageHint: "Select an image from the Media Library.",
    status: "Status",
    sortOrder: "Display Order",
    featured: "Featured Category",
    featuredDescription:
      "Display this category as the large primary card. Only one category can be featured.",
    showOnHome: "Show on Home Page",
    showOnHomeDescription:
      "Display this category in the Product Categories section on the home page.",
    productCount: "Products",
  },

  seo: {
    title: "Search Engine Optimization",
    description:
      "Leave fields empty to automatically use the category name and description.",
    metaTitle: "SEO Title",
    metaDescription: "SEO Description",
    keywords: "SEO Keywords",
    keywordsHint: "Separate each keyword with a comma.",
  },

  language: {
    english: "English",
    thai: "Thai",
  },

  icons: {
    doorCloser: "Door Closer",
    leverHandle: "Lever Handle",
    lock: "Lock & Cylinder",
    hinge: "Hinge",
    exit: "Emergency Exit",
    seal: "Door Seal",
    fire: "Fire Door",
    electronicLock: "Electronic Lock",
    door: "General Door",
  },

  table: {
    category: "Category",
    slug: "Slug",
    status: "Status",
    products: "Products",
    order: "Order",
    home: "Home",
    actions: "Actions",
  },

  badges: {
    featured: "Featured",
    shownOnHome: "Shown on home",
    hiddenFromHome: "Hidden from home",
  },

  form: {
    createEyebrow: "New Category",
    createTitle: "Add Product Category",
    createDescription: "Create category information in English and Thai.",

    editEyebrow: "Category Details",
    editTitle: "Edit Product Category",
    editDescription: "Update category information, image and SEO settings.",

    contentSection: "Category Content",
    displaySection: "Display Settings",
    seoSection: "SEO Settings",
  },

  mediaPicker: {
    eyebrow: "Media Library",
    title: "Select Category Image",
    description: "Choose an active image from the Media Library.",
    searchPlaceholder: "Search images...",
    empty: "No images were found.",
    selected: "Selected",
    useImage: "Use Selected Image",
  },

  empty: {
    title: "No product categories",
    description: "Create the first category to begin organizing HCS products.",
    filteredTitle: "No matching categories",
    filteredDescription: "Try changing the search text or status filter.",
  },

  confirmDelete: {
    title: "Move this category to trash?",
    text: "The category can be restored later. Categories containing products cannot be deleted.",
    confirm: "Move to Trash",
    cancel: "Cancel",
  },

  messages: {
    loadFailed: "Unable to load categories.",
    createSuccess: "Category created successfully.",
    createFailed: "Unable to create category.",
    updateSuccess: "Category updated successfully.",
    updateFailed: "Unable to update category.",
    deleteSuccess: "Category moved to trash.",
    deleteFailed: "Unable to move category to trash.",
    imageLoadFailed: "Unable to load images from the Media Library.",
    slugExists: "This URL slug is already used by another category.",
    orderSuccess: "Category order updated.",
    orderFailed: "Unable to update category order.",
  },

  pagination: {
    showing: "Showing {{count}} categories",
    end: "All categories have been loaded",
  },
};

export default categoriesEn;
