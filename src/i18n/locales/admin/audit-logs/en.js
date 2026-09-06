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
    USER_DELETE: "Deleted administrator",
    USER_RESTORE: "Restored administrator",
    USER_PREFERENCE_UPDATE: "Updated preferences",
    SITE_SETTINGS_CREATE: "Created site settings",
    SITE_SETTINGS_UPDATE: "Updated site settings",
  },

  entities: {
    auth: "Authentication",
    user: "Administrator",
    siteSettings: "Site settings",
    page: "Page",
    category: "Category",
    product: "Product",
    solution: "Solution",
    project: "Project",
    standard: "Standard",
    download: "Download",
    media: "Media",
    message: "Message",
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
