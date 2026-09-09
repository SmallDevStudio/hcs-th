const messagesEn = {
  eyebrow: "Communication",
  title: "Contact Messages",
  description:
    "Review and manage enquiries submitted through the public contact form.",

  filters: {
    allStatuses: "All statuses",
    searchPlaceholder: "Search name, company, email, project or message...",
  },

  table: {
    sender: "Sender",
    enquiry: "Enquiry",
    message: "Message",
    status: "Status",
    receivedAt: "Received",
    actions: "Actions",
  },

  statuses: {
    new: "New",
    read: "Read",
    replied: "Replied",
    archived: "Archived",
  },

  enquiryTypes: {
    product: "Product enquiry",
    project: "Project specification",
    technical: "Technical support",
    partnership: "Partnership & distribution",
    general: "General enquiry",
  },

  productCategories: {
    "door-closers": "Door Closers",
    "lever-handles": "Lever Handles",
    "locks-cylinders": "Locks & Cylinders",
    hinges: "Hinges",

    "panic-exit-hardware": "Panic Exit Hardware",

    "door-window-seals": "Door & Window Seals",

    "fire-doors": "Fire Doors",

    "electronic-locks": "Electronic Locks",

    other: "Other",
  },

  fields: {
    fullName: "Full name",
    company: "Company",
    email: "Email",
    phone: "Phone",

    enquiryType: "Enquiry type",

    productCategory: "Product category",

    projectName: "Project name",

    projectLocation: "Project location",

    message: "Message",
    attachment: "Attachment",
    status: "Status",

    assignedTo: "Assigned to",

    internalNote: "Internal note",
  },

  detail: {
    eyebrow: "Enquiry details",

    management: "Message management",

    notifications: "Notification delivery",
  },

  notifications: {
    inApp: "In-app",
    email: "Email",
    line: "LINE",
  },

  actions: {
    view: "View message",
    close: "Close",

    refresh: "Refresh",

    search: "Search",
    reset: "Reset",

    save: "Save changes",
    saving: "Saving...",

    delete: "Move to trash",
    deleting: "Deleting...",

    loadMore: "Load more",

    loadingMore: "Loading...",
  },

  messages: {
    loading: "Loading contact messages...",

    loadFailed: "Unable to load contact messages",

    detailLoadFailed: "Unable to load message details",

    updated: "Contact message updated successfully",

    updateFailed: "Unable to update contact message",

    deleted: "Contact message moved to trash",

    deleteFailed: "Unable to delete contact message",

    downloadFailed: "Unable to download the attachment",
  },

  confirmDelete: {
    title: "Move this message to trash?",

    text: "The message can be restored from Trash during the retention period.",

    confirm: "Move to trash",

    cancel: "Cancel",
  },

  pagination: {
    showing: "Showing {{count}} messages",

    end: "No more messages",
  },

  empty: {
    title: "No contact messages yet",

    description:
      "New enquiries submitted through the public contact form will appear here.",

    filteredTitle: "No matching messages",

    filteredDescription: "Try changing the status filter or search terms.",
  },
};

export default messagesEn;
