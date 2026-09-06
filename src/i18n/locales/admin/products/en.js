const productsEn = {
  eyebrow: "Product Management",

  title: "Products",

  description:
    "Manage product information, technical specifications, finishes, standards, images, documents and SEO.",

  actions: {
    create: "Add Product",
    edit: "Edit Product",
    delete: "Move to Trash",
    refresh: "Refresh",
    search: "Search",
    clear: "Clear filters",
    close: "Close",
    cancel: "Cancel",
    save: "Save Product",
    saving: "Saving...",
    saveOrder: "Save Order",
    selectImage: "Select Image",
    changeImage: "Change Image",
    removeImage: "Remove Image",
    addGalleryImage: "Add Gallery Images",
    addDocument: "Add Documents",
    addFeature: "Add Feature",
    addVariation: "Add Variation",
    addSpecification: "Add Specification",
    addFinish: "Add Finish",
    addStandard: "Add Standard",
    remove: "Remove",
    generateSlug: "Generate Slug",
    generateTypeSlug: "Generate Type Slug",
    loadMore: "Load More",
    loadingMore: "Loading...",
  },

  filters: {
    search: "Search products",
    searchPlaceholder: "Search by name, model, SKU or standard...",

    status: "Status",
    allStatuses: "All statuses",

    category: "Category",
    allCategories: "All categories",

    productType: "Product type",
    allProductTypes: "All product types",

    fireRated: "Fire rating",
    allFireRatings: "All products",
    fireRatedOnly: "Fire-rated only",
    nonFireRatedOnly: "Non fire-rated only",
  },

  statuses: {
    draft: "Draft",
    published: "Published",
    inactive: "Inactive",
  },

  table: {
    product: "Product",
    model: "Model / Reference",
    category: "Category",
    type: "Product Type",
    status: "Status",
    home: "Home",
    fireRated: "Fire Rated",
    order: "Order",
    actions: "Actions",
  },

  badges: {
    featured: "Featured",
    showOnHome: "Show on Home",
    fireRated: "Fire Rated",
    noImage: "No image",
  },

  form: {
    createEyebrow: "New Product",
    createTitle: "Add Product",
    createDescription:
      "Enter bilingual product content and technical information.",

    editEyebrow: "Product Details",
    editTitle: "Edit Product",
    editDescription: "Update product content, specifications, media and SEO.",

    basicSection: "Basic Information",

    descriptionSection: "Product Content",

    mediaSection: "Images and Documents",

    technicalSection: "Technical Information",

    displaySection: "Publishing and Display",

    seoSection: "Search Engine Optimization",

    featuresSection: "Features",

    variationsSection: "Variations",

    specificationsSection: "Specifications",

    finishesSection: "Available Finishes",

    standardsSection: "Standards and Certifications",

    emptyFeatures: "No product features have been added.",

    emptyVariations: "No product variations have been added.",

    emptySpecifications: "No specifications have been added.",

    emptyFinishes: "No finishes have been added.",

    emptyStandards: "No standards have been added.",
  },

  fields: {
    name: "Product Name",

    slug: "URL Slug",
    slugHint: "Lowercase letters, numbers and hyphens only.",

    model: "Model / Reference",

    sku: "SKU",

    category: "Product Category",

    productType: "Product Type",

    productTypeSlug: "Product Type Slug",

    series: "Series / Range",

    shortDescription: "Short Description",

    description: "Full Description",

    primaryImage: "Primary Product Image",

    primaryImageHint:
      "Recommended transparent or white-background product image.",

    gallery: "Product Gallery",

    galleryHint: "Additional product images. Maximum 12 files.",

    documents: "Product Documents",

    documentsHint:
      "Datasheets, installation guides and certificates. Maximum 12 files.",

    feature: "Feature",

    variation: "Variation",

    specificationLabel: "Specification",

    specificationValue: "Value",

    finishCode: "Finish Code",

    finishName: "Finish Name",

    standardName: "Standard",

    classification: "Classification",

    conformityReference: "Conformity Reference",

    fireRated: "Fire-rated product",

    status: "Status",

    featured: "Featured product",

    showOnHome: "Show on Home page",

    sortOrder: "Display Order",

    seoTitle: "SEO Title",

    seoDescription: "SEO Description",

    seoKeywords: "SEO Keywords",

    seoKeywordsHint: "Separate keywords with commas.",
  },

  placeholders: {
    nameEn: "Cam Action Door Closer",
    nameTh: "โช้คอัพประตูระบบแคมแอคชัน",

    slug: "kd-915-cam-action-door-closer",

    model: "KD 915",

    sku: "KD-915",

    productTypeEn: "Door Closer",

    productTypeTh: "โช้คอัพประตู",

    productTypeSlug: "door-closer",

    seriesEn: "Premium Door Closers",

    seriesTh: "โช้คอัพประตูรุ่นพรีเมียม",

    specificationLabelEn: "Door width",

    specificationLabelTh: "ความกว้างประตู",

    specificationValueEn: "Up to 1,250 mm",

    specificationValueTh: "สูงสุด 1,250 มม.",

    finishCode: "SSS",

    finishNameEn: "Satin Stainless Steel",

    finishNameTh: "สเตนเลสสตีลผิวด้าน",

    standardName: "EN 1154",

    classification: "4 8 3/6 1 1 3",

    conformityReference: "1121-CPR-AD5001",
  },

  mediaPicker: {
    imageEyebrow: "Product Images",
    imageTitle: "Select Product Images",
    imageDescription: "Choose images from the Media Library for this product.",

    documentEyebrow: "Product Documents",
    documentTitle: "Select Product Documents",
    documentDescription:
      "Choose datasheets, installation guides, certificates or other downloadable files.",

    search: "Search",
    imageSearchPlaceholder: "Search product images...",
    documentSearchPlaceholder: "Search documents...",

    selected: "Selected {{count}} / {{maximum}}",

    loading: "Loading media files...",

    emptyImages: "No images found.",
    emptyDocuments: "No documents found.",

    loadMore: "Load More",

    cancel: "Cancel",

    useImage: "Use Image",
    useImages: "Use Selected Images",
    useDocuments: "Use Selected Documents",

    singleSelectionHint: "Select one file to continue.",
    multipleSelectionHint:
      "You can select up to the maximum number of files shown above.",
  },

  confirmDelete: {
    title: "Move this product to trash?",

    text: "The product can be restored later. Its category count and media usage will be released.",

    confirm: "Move to Trash",

    cancel: "Cancel",
  },

  messages: {
    loadFailed: "Unable to load products.",

    createSuccess: "Product created successfully.",

    createFailed: "Unable to create the product.",

    updateSuccess: "Product updated successfully.",

    updateFailed: "Unable to update the product.",

    deleteSuccess: "Product moved to trash successfully.",

    deleteFailed: "Unable to move the product to trash.",

    orderSuccess: "Product order saved successfully.",

    orderFailed: "Unable to save product order.",

    slugExists: "This product slug is already in use.",

    skuExists: "This SKU is already in use.",

    categoryLoadFailed: "Unable to load product categories.",

    mediaLoadFailed: "Unable to load media files.",

    publishIncomplete:
      "Complete both languages and select a primary image before publishing.",
  },

  empty: {
    title: "No products found",

    description: "Add the first product to begin building the product catalog.",

    filteredDescription: "No products match the selected filters.",
  },
};

export default productsEn;
