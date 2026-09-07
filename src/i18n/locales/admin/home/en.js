const adminHomeEn = {
  heroes: {
    eyebrow: "Home Page Management",

    title: "Home Hero Slides",

    description:
      "Manage promotional Hero slides shown at the top of the public Home page.",

    fallbackTitle: "Untitled Hero Slide",

    summary: "{{count}} Hero slides",

    orderUnsaved: "The display order has not been saved.",

    statuses: {
      draft: "Draft",

      published: "Published",
    },

    visibility: {
      draft: "Not Published",

      active: "Active",

      scheduled: "Scheduled",

      expired: "Expired",
    },

    filters: {
      status: "Status",

      allStatuses: "All statuses",
    },

    table: {
      hero: "Hero Slide",

      status: "Status",

      visibility: "Visibility",

      schedule: "Display Schedule",

      order: "Order",

      actions: "Actions",
    },

    actions: {
      add: "Add Hero Slide",

      edit: "Edit Hero Slide",

      delete: "Delete Hero Slide",

      refresh: "Refresh",

      filter: "Filter",

      clearFilters: "Clear",

      saveOrder: "Save Order",

      moveUp: "Move up",

      moveDown: "Move down",

      selectImage: "Select Image",

      changeImage: "Change Image",

      removeImage: "Remove image",

      cancel: "Cancel",

      close: "Close",

      save: "Save Hero Slide",
    },

    form: {
      createEyebrow: "Home Hero",

      editEyebrow: "Hero Slide Details",

      createTitle: "Add Hero Slide",

      editTitle: "Edit Hero Slide",

      createDescription: "Create a promotional slide for the public Home page.",

      editDescription:
        "Update Hero content, images, actions and display schedule.",

      contentSection: "Hero Content",

      contentDescription:
        "Enter the bilingual content shown over the Hero image.",

      actionsSection: "Call-to-Action Buttons",

      actionsDescription:
        "Configure the primary and secondary links displayed on this slide.",

      primaryAction: "Primary Button",

      secondaryAction: "Secondary Button",

      mediaSection: "Hero Images",

      mediaDescription:
        "Select optimized images for desktop and mobile displays.",

      mobileFallbackHint:
        "If no mobile image is selected, the desktop image will be used automatically.",

      displaySection: "Publishing and Display",

      displayDescription:
        "Set the publication status and ordering of this slide.",

      scheduleSection: "Display Schedule",

      scheduleDescription:
        "Optionally schedule when this Hero slide starts and stops appearing.",
    },

    fields: {
      eyebrow: "Eyebrow",

      titleLineOne: "Title — First Line",

      titleLineTwo: "Title — Second Line",

      description: "Description",

      actionLabel: "Button Label",

      actionUrl: "Button URL",

      actionUrlHint:
        "Use an internal path such as /products or a complete HTTPS URL.",

      desktopImage: "Desktop Image",

      desktopImageHint: "Main Hero image for desktop and tablet displays.",

      desktopImageEmpty: "Select a wide image for the desktop Hero.",

      desktopImageSize: "Recommended size: 1920 × 760 px",

      mobileImage: "Mobile Image",

      mobileImageHint: "Optional portrait image optimized for mobile screens.",

      mobileImageEmpty: "Select an optional portrait image for mobile devices.",

      mobileImageSize: "Recommended size: 900 × 1200 px",

      status: "Status",

      sortOrder: "Display Order",

      sortOrderHint: "Slides with lower numbers appear first.",

      startsAt: "Starts At",

      startsAtHint: "Leave empty to show immediately after publishing.",

      endsAt: "Ends At",

      endsAtHint: "Leave empty to keep displaying indefinitely.",
    },

    empty: {
      title: "No Hero slides found",

      description: "Create the first Hero slide for the public Home page.",

      filteredDescription: "No Hero slides match the selected status.",
    },

    delete: {
      title: "Move Hero slide to trash?",

      description:
        '"{{title}}" will be removed from the Home page and moved to trash.',

      confirm: "Move to Trash",
    },

    messages: {
      loadFailed: "Unable to load Home Hero slides.",

      createSuccess: "Home Hero slide created successfully.",

      createFailed: "Unable to create Home Hero slide.",

      updateSuccess: "Home Hero slide updated successfully.",

      updateFailed: "Unable to update Home Hero slide.",

      deleteSuccess: "Home Hero slide moved to trash.",

      deleteFailed: "Unable to delete Home Hero slide.",

      reorderSuccess: "Hero slide order saved successfully.",

      reorderFailed: "Unable to save Hero slide order.",

      publishIncomplete:
        "Published Hero slides require English and Thai titles and a desktop image.",
    },
  },
};

export default adminHomeEn;
