const adminStandardsEn = {
  page: {
    eyebrow: "Standards Management",

    title: "Standards & Certificates",

    description:
      "Manage standards, test reports, declarations, certificates, related products and compliance documents.",
  },

  actions: {
    add: "Add Standard",
    edit: "Edit Standard",
    delete: "Move to Trash",

    refresh: "Refresh",
    search: "Search",
    reset: "Reset",

    save: "Save Standard",
    saving: "Saving...",

    cancel: "Cancel",
    close: "Close",

    selectDocument: "Select Document",

    changeDocument: "Change Document",

    removeDocument: "Remove Document",

    previewDocument: "Preview Document",
  },

  filters: {
    searchLabel: "Search standards",

    searchPlaceholder: "Search by code, name, issuer or document...",

    status: "Status",
    allStatuses: "All statuses",

    documentType: "Document Type",

    allDocumentTypes: "All document types",

    documentLanguage: "Document Language",

    allLanguages: "All languages",
  },

  table: {
    standard: "Standard / Certificate",

    code: "Code",

    documentType: "Document Type",

    language: "Language",

    categories: "Product Categories",

    products: "Products",

    status: "Status",

    home: "Home",

    featured: "Featured",

    order: "Order",

    actions: "Actions",

    showOnHome: "Show on Home",

    notShown: "Not shown",

    noDocument: "No document",

    categoryCount: "{{count}} categories",

    productCount: "{{count}} products",
  },

  status: {
    draft: "Draft",
    published: "Published",
    inactive: "Inactive",
  },

  documentTypes: {
    certificate: "Certificate",

    "test-report": "Test Report",

    "declaration-of-performance": "Declaration of Performance",

    "product-compliance": "Product Compliance",

    "quality-certificate": "Quality Certificate",

    "technical-document": "Technical Document",

    other: "Other",
  },

  languages: {
    en: "English",
    th: "Thai",

    bilingual: "English / Thai",

    other: "Other",
  },

  form: {
    createEyebrow: "Standard Details",

    createTitle: "Add Standard",

    createDescription: "Add a standard, certificate or compliance document.",

    editEyebrow: "Standard Details",

    editTitle: "Edit Standard",

    editDescription:
      "Update standard information, document, product relationships and SEO.",

    sections: {
      basic: "Basic Information",

      content: "Standard Content",

      classification: "Classification & Issuer",

      document: "Certificate or Document",

      categories: "Related Product Categories",

      products: "Related Products",

      dates: "Document Dates",

      publishing: "Publishing and Display",

      seo: "Search Engine Optimization",
    },

    fields: {
      code: "Standard Code",

      slug: "Slug",

      nameEn: "Name — English",

      nameTh: "Name — Thai",

      shortDescriptionEn: "Short Description — English",

      shortDescriptionTh: "Short Description — Thai",

      descriptionEn: "Full Description — English",

      descriptionTh: "Full Description — Thai",

      classificationEn: "Classification — English",

      classificationTh: "Classification — Thai",

      conformityReference: "Conformity Reference",

      issuerEn: "Issuer — English",

      issuerTh: "Issuer — Thai",

      documentType: "Document Type",

      documentLanguage: "Document Language",

      issueDate: "Issue Date",

      expiryDate: "Expiry Date",

      status: "Status",

      sortOrder: "Display Order",

      featured: "Featured Standard",

      showOnHome: "Show on Home page",

      seoTitleEn: "SEO Title — English",

      seoTitleTh: "SEO Title — Thai",

      seoDescriptionEn: "SEO Description — English",

      seoDescriptionTh: "SEO Description — Thai",

      seoKeywordsEn: "SEO Keywords — English",

      seoKeywordsTh: "SEO Keywords — Thai",
    },

    placeholders: {
      code: "e.g. EN 1154",

      slug: "e.g. en-1154-door-closer-standard",

      nameEn: "e.g. Controlled Door Closing Devices",

      nameTh: "e.g. มาตรฐานอุปกรณ์ควบคุมการปิดประตู",

      shortDescriptionEn: "Briefly describe this standard or certificate...",

      shortDescriptionTh: "อธิบายมาตรฐานหรือใบรับรองโดยย่อ...",

      descriptionEn: "Enter complete standard information...",

      descriptionTh: "กรอกข้อมูลมาตรฐานฉบับเต็ม...",

      classificationEn:
        "e.g. Performance requirements for controlled door closers",

      classificationTh: "เช่น ข้อกำหนดด้านประสิทธิภาพสำหรับโช้คอัพประตู",

      conformityReference: "e.g. EN 1154:1996/A1:2002",

      issuerEn: "e.g. European Committee for Standardization",

      issuerTh: "เช่น คณะกรรมการมาตรฐานยุโรป",

      categorySearch: "Search product categories...",

      productSearch: "Search products by name, model or SKU...",

      seoTitle: "Leave empty to generate automatically",

      seoDescription: "Leave empty to use the short description",

      seoKeywords: "Separate keywords with commas",
    },

    hints: {
      code: "Use the official standard or certificate code.",

      slug: "Used in the public page URL. Lowercase letters, numbers and hyphens only.",

      document: "Select one PDF or compliance document from the Media Library.",

      documentUpload:
        "PDF, DOC or DOCX. Uploads from this page are stored in the Certificates folder.",

      categories: "Select product categories covered by this standard.",

      products: "Select individual products related to this standard.",

      dates:
        "Expiry date is optional. It cannot be earlier than the issue date.",

      seo: "SEO title and description are generated automatically when left empty.",

      keywords: "Separate keywords with commas.",
    },

    empty: {
      document: "No certificate or document selected",

      categories: "No product categories found",

      products: "No products found",
    },
  },

  confirmDelete: {
    title: "Move this standard to trash?",

    description:
      "The standard can be restored later. Its document usage and relationships will be released.",

    confirm: "Move to Trash",

    cancel: "Cancel",
  },

  messages: {
    loadFailed: "Unable to load standards",

    createSuccess: "Standard created successfully",

    createFailed: "Unable to create standard",

    updateSuccess: "Standard updated successfully",

    updateFailed: "Unable to update standard",

    deleteSuccess: "Standard moved to trash",

    deleteFailed: "Unable to delete standard",

    reorderSuccess: "Standard order updated",

    reorderFailed: "Unable to update standard order",

    documentLoadFailed: "Unable to load documents",

    categoriesLoadFailed: "Unable to load product categories",

    productsLoadFailed: "Unable to load products",

    selectionLimit: "Maximum selection reached",

    validationFailed: "Please check the required fields",
  },

  empty: {
    title: "No standards found",

    description: "Add the first standard, certificate or compliance document.",

    filteredTitle: "No matching standards",

    filteredDescription: "Try changing the search term or filters.",
  },

  pagination: {
    showing: "Showing {{count}} standards",

    loadMore: "Load More",

    loading: "Loading...",
  },
};

export default adminStandardsEn;
