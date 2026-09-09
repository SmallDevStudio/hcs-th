const trashEn = {
  eyebrow: "Deleted Data",
  title: "Trash",
  description:
    "Review, restore or permanently delete items removed from the system.",

  filters: {
    entityType: "Data type",
    allEntities: "All data types",
    apply: "Apply filter",
    reset: "Reset",
  },

  table: {
    item: "Item",
    type: "Data type",
    deletedBy: "Deleted by",
    deletedAt: "Deleted at",
    expiresAt: "Retention until",
    actions: "Actions",
    unknownUser: "Unknown user",
    unnamed: "Unnamed item",
  },

  entities: {
    page: "Page",
    homeSection: "Home hero slide",
    category: "Category",
    product: "Product",
    solution: "Solution",
    project: "Project",
    standard: "Standard",
    download: "Download",
    media: "Media",
    message: "Message",
  },

  actions: {
    restore: "Restore",
    restoring: "Restoring...",
    deletePermanently: "Delete permanently",
    deleting: "Deleting...",
    loadMore: "Load more",
    loading: "Loading...",
  },

  confirmRestore: {
    title: "Restore this item?",
    text: "The item will return to its original collection.",
    confirm: "Restore item",
    cancel: "Cancel",
  },

  confirmDelete: {
    title: "Permanently delete this item?",
    text: "This action cannot be undone and the original data will be permanently removed.",
    confirm: "Delete permanently",
    cancel: "Cancel",
  },

  messages: {
    restored: "The item was restored successfully.",
    restoreFailed: "Unable to restore the item.",
    deleted: "The item was permanently deleted.",
    deleteFailed: "Unable to permanently delete the item.",
    loadFailed: "Unable to load trash items.",
    empty: "There are no items in trash.",
    filteredEmpty: "No trash items match the selected filter.",
  },

  pagination: {
    showing: "Showing {{count}} items",
    end: "No more items",
  },
};

export default trashEn;
