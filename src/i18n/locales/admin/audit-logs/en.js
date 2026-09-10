const auditLogsEn = {
  eyebrow: "System Activity",
  title: "Audit Logs",
  description:
    "Review sign-ins and changes made by administrators throughout the system.",

  filters: {
    action: "Action",
    entityType: "Data type",
    actorUid: "User UID",
    dateFrom: "From date",
    dateTo: "To date",
    allActions: "All actions",
    allEntities: "All data types",
    actorPlaceholder: "Firebase user UID",
    apply: "Apply filters",
    reset: "Reset",
  },

  table: {
    date: "Date",
    user: "User",
    action: "Action",
    entity: "Data",
    source: "Source",
    details: "Details",
    unknownUser: "Unknown user",
    system: "System",
    view: "View",
  },

  actions: {
    AUTH_LOGIN: "Signed in",
    AUTH_LOGOUT: "Signed out",

    USER_CREATE: "Created administrator",
    USER_UPDATE: "Updated administrator",
    USER_DELETE: "Permanently deleted administrator",
    USER_RESTORE: "Restored administrator",
    USER_PREFERENCE_UPDATE: "Updated account preferences",
    USER_PASSWORD_CHANGE: "Changed own password",
    USER_PASSWORD_SET: "Set administrator password",
    USER_PASSWORD_RESET_REQUEST: "Requested password reset",
    USER_LINE_CONNECT: "Connected LINE account",
    USER_LINE_DISCONNECT: "Disconnected LINE account",

    GROUP_CREATE: "Created permission group",
    GROUP_UPDATE: "Updated permission group",
    GROUP_DELETE: "Deleted permission group",

    SITE_SETTINGS_CREATE: "Created site settings",
    SITE_SETTINGS_UPDATE: "Updated site settings",

    PAGE_CREATE: "Created page",
    PAGE_UPDATE: "Updated page",
    PAGE_PUBLISH: "Published page",
    PAGE_UNPUBLISH: "Unpublished page",
    PAGE_DELETE: "Deleted page",
    PAGE_RESTORE: "Restored page",

    HOME_SECTION_CREATE: "Created home hero slide",
    HOME_SECTION_UPDATE: "Updated home hero slide",
    HOME_SECTION_PUBLISH: "Published home hero slide",
    HOME_SECTION_UNPUBLISH: "Unpublished home hero slide",
    HOME_SECTION_DELETE: "Deleted home hero slide",
    HOME_SECTION_RESTORE: "Restored home hero slide",

    CATEGORY_CREATE: "Created product category",
    CATEGORY_UPDATE: "Updated product category",
    CATEGORY_DELETE: "Deleted product category",
    CATEGORY_RESTORE: "Restored product category",

    PRODUCT_CREATE: "Created product",
    PRODUCT_UPDATE: "Updated product",
    PRODUCT_PUBLISH: "Published product",
    PRODUCT_UNPUBLISH: "Unpublished product",
    PRODUCT_DELETE: "Deleted product",
    PRODUCT_RESTORE: "Restored product",

    SOLUTION_CREATE: "Created solution",
    SOLUTION_UPDATE: "Updated solution",
    SOLUTION_PUBLISH: "Published solution",
    SOLUTION_UNPUBLISH: "Unpublished solution",
    SOLUTION_DELETE: "Deleted solution",
    SOLUTION_RESTORE: "Restored solution",

    PROJECT_CREATE: "Created project",
    PROJECT_UPDATE: "Updated project",
    PROJECT_PUBLISH: "Published project",
    PROJECT_UNPUBLISH: "Unpublished project",
    PROJECT_DELETE: "Deleted project",
    PROJECT_RESTORE: "Restored project",

    STANDARD_CREATE: "Created standard",
    STANDARD_UPDATE: "Updated standard",
    STANDARD_DELETE: "Deleted standard",
    STANDARD_RESTORE: "Restored standard",

    DOWNLOAD_CREATE: "Created download",
    DOWNLOAD_UPDATE: "Updated download",
    DOWNLOAD_DELETE: "Deleted download",
    DOWNLOAD_RESTORE: "Restored download",

    MEDIA_UPLOAD: "Uploaded media",
    MEDIA_UPDATE: "Updated media",
    MEDIA_DELETE: "Deleted media",
    MEDIA_RESTORE: "Restored media",
    MEDIA_CLEANUP: "Cleaned up media",

    MESSAGE_UPDATE: "Updated contact message",
    MESSAGE_DELETE: "Deleted contact message",
    MESSAGE_RESTORE: "Restored contact message",

    TRASH_RESTORE: "Restored deleted data",
    TRASH_DELETE_PERMANENTLY: "Permanently deleted data",
  },

  entities: {
    auth: "Authentication",
    user: "Administrator",
    userGroup: "Permission group",
    siteSettings: "Site settings",
    homeSection: "Home hero slide",
    page: "Page",
    category: "Category",
    product: "Product",
    solution: "Solution",
    project: "Project",
    standard: "Standard",
    download: "Download",
    media: "Media",
    message: "Contact message",
    trash: "Trash",
  },

  details: {
    title: "Activity details",
    action: "Action",
    entity: "Data",
    entityId: "Document ID",
    actor: "Performed by",
    date: "Date and time",
    ipAddress: "IP address",
    userAgent: "User agent",
    changes: "Changes",
    before: "Before",
    after: "After",
    noChanges: "No change details were recorded.",
    close: "Close",
    target: "Target",
  },

  pagination: {
    showing: "Showing {{count}} records",
    loadMore: "Load more",
    loading: "Loading...",
    end: "No more records",
  },

  messages: {
    loadFailed: "Unable to load audit logs",
    noResults: "No audit logs match the selected filters.",
  },
};

export default auditLogsEn;
