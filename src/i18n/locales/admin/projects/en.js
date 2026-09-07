const projectsEn = {
  page: {
    eyebrow: "Project Management",
    title: "Project References",
    description:
      "Manage project references, locations, building types, related products, solutions, images and SEO.",
  },

  actions: {
    create: "Add Project",
    edit: "Edit Project",
    delete: "Move to Trash",
    refresh: "Refresh",
    search: "Search",
    reset: "Reset",
    loadMore: "Load More",
    save: "Save Project",
    saving: "Saving...",
    cancel: "Cancel",
    close: "Close",
    saveOrder: "Save Order",
    generateSlug: "Generate Slug",
    selectCover: "Select Cover",
    changeCover: "Change Cover",
    addGalleryImage: "Add Gallery Images",
    removeImage: "Remove Image",
    addResult: "Add Result",
    remove: "Remove",
  },

  filters: {
    search: "Search projects",
    searchPlaceholder: "Search by project name, location, client or year...",
    status: "Status",
    allStatuses: "All statuses",
    buildingType: "Building Type",
    allBuildingTypes: "All building types",
    featured: "Featured",
    allFeatured: "All projects",
    featuredOnly: "Featured only",
  },

  table: {
    project: "Project",
    location: "Location",
    buildingType: "Building Type",
    year: "Year",
    status: "Status",
    home: "Home",
    featured: "Featured",
    order: "Order",
    actions: "Actions",
    showOnHome: "Show on Home",
    notShown: "—",
  },

  statuses: {
    draft: "Draft",
    published: "Published",
  },

  buildingTypes: {
    hospitality: "Hospitality",
    healthcare: "Healthcare",
    commercial: "Commercial",
    industrial: "Industrial",
    residential: "Residential",
    education: "Education",
    government: "Government",
    retail: "Retail",
    transportation: "Transportation",
    "mixed-use": "Mixed-use",
    other: "Other",
  },

  form: {
    createEyebrow: "Project Details",
    editEyebrow: "Project Details",
    createTitle: "Add Project",
    editTitle: "Edit Project",
    createDescription:
      "Create a bilingual project reference with media, relationships and SEO.",
    editDescription: "Update project content, media, relationships and SEO.",

    basicSection: "Basic Information",
    contentSection: "Project Content",
    mediaSection: "Project Media",
    relationshipsSection: "Related Content",
    resultsSection: "Project Results",
    displaySection: "Publishing and Display",
    seoSection: "Search Engine Optimization",

    emptyResults: "No project results have been added.",
    emptyGallery: "No gallery images selected.",

    seoHint:
      "SEO title, description and keywords are automatically filled by the server when left empty.",
  },

  fields: {
    name: "Project Name",
    slug: "Slug",
    slugHint:
      "Used in the public project URL. Lowercase letters, numbers and hyphens only.",

    buildingType: "Building Type",
    location: "Location",
    client: "Client",
    year: "Completion Year",

    shortDescription: "Short Description",
    description: "Project Description",
    challenge: "Project Challenge",
    solution: "HCS Solution",

    result: "Result",

    coverImage: "Cover Image",
    coverImageHint:
      "Select one landscape image for cards and the project header.",

    gallery: "Project Gallery",
    galleryHint:
      "Select multiple images. The cover image cannot be repeated in the gallery.",

    relatedProducts: "Related Products",
    relatedProductsHint: "Products supplied or recommended for this project.",

    relatedSolutions: "Related Solutions",
    relatedSolutionsHint: "Solutions associated with this project.",

    status: "Status",
    sortOrder: "Display Order",
    featured: "Featured Project",
    showOnHome: "Show on Home page",

    seoTitle: "SEO Title",
    seoDescription: "SEO Description",
    seoKeywords: "SEO Keywords",
    seoKeywordsHint: "Separate keywords with commas.",

    productSearch: "Search products...",
    solutionSearch: "Search solutions...",
    selectedItems: "{{count}} selected",
    noProducts: "No products available",
    noSolutions: "No solutions available",
    selectionLimit: "Maximum {{count}} items",
  },

  placeholders: {
    name: "Commercial Tower, Bangkok",
    slug: "commercial-tower-bangkok",
    location: "Bangkok, Thailand",
    client: "Project owner or client",
    year: "2026",
  },

  confirmDelete: {
    title: "Move this project to trash?",
    text: "The project can be restored later. Its media usage will be released.",
    confirm: "Move to Trash",
    cancel: "Cancel",
  },

  messages: {
    createSuccess: "Project created successfully",
    updateSuccess: "Project updated successfully",
    deleteSuccess: "Project moved to trash",
    reorderSuccess: "Project order updated successfully",

    createFailed: "Unable to create project",
    updateFailed: "Unable to update project",
    deleteFailed: "Unable to delete project",
    loadFailed: "Unable to load projects",
    reorderFailed: "Unable to update project order",

    slugExists: "This project slug is already in use",
    publishIncomplete:
      "Complete the required bilingual content, location and cover image before publishing.",
  },

  empty: {
    title: "No projects found",
    description: "Create the first project reference for the HCS website.",
    filteredDescription: "No projects match the selected filters.",
  },
};

export default projectsEn;
