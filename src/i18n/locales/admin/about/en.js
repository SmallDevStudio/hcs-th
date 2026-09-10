const adminAboutEn = {
  eyebrow: "Website Pages",

  title: "About Page Builder",

  description:
    "Build and publish the bilingual About page using flexible content sections.",

  status: {
    draft: "Draft",

    published: "Published",

    unpublished: "Not published",

    unsaved: "Unsaved changes",

    saved: "All changes saved",

    saving: "Saving draft...",

    publishing: "Publishing...",

    unpublishing: "Unpublishing...",

    lastSaved: "Last saved {{date}}",

    draftVersion: "Draft version {{version}}",

    publishedVersion: "Published version {{version}}",
  },

  actions: {
    save: "Save Draft",

    publish: "Publish",

    unpublish: "Unpublish",

    reload: "Reload",

    preview: "Preview",

    addSection: "Add Section",

    duplicate: "Duplicate",

    delete: "Delete",

    moveUp: "Move up",

    moveDown: "Move down",

    enable: "Enable",

    disable: "Disable",

    expand: "Expand",

    collapse: "Collapse",

    addAction: "Add Button",

    addItem: "Add Item",

    selectImage: "Select Image",

    changeImage: "Change Image",

    removeImage: "Remove Image",

    retry: "Try Again",
  },

  seo: {
    eyebrow: "Search Engine Optimization",

    title: "SEO Settings",

    description:
      "Configure the page title, search description and social sharing image.",

    fields: {
      title: "SEO Title",

      description: "SEO Description",

      image: "Social Sharing Image",

      imageAlt: "Image Alternative Text",
    },

    hints: {
      title: "Recommended length is between 50 and 60 characters.",

      description: "Recommended length is between 140 and 160 characters.",

      image:
        "Recommended size: 1200 × 630 px. Used when sharing the About page.",

      localized: "Enter the information separately for English and Thai.",
    },

    counters: {
      title: "{{count}}/{{maximum}} characters",

      description: "{{count}}/{{maximum}} characters",
    },
  },

  sections: {
    eyebrow: "Page Content",

    title: "Content Sections",

    description:
      "Add, arrange and configure the sections displayed on the public About page.",

    count: "{{count}} sections",

    empty: {
      title: "No sections yet",

      description: "Add the first section to begin building the About page.",
    },

    addMenuTitle: "Choose a Section Type",

    internalLabel: "Internal Label",

    internalLabelHint: "Used only in Admin to help identify this section.",

    sectionEnabled: "Section enabled",

    sectionDisabled: "Section hidden",

    types: {
      hero: {
        title: "Hero",

        description:
          "Large introductory section displayed at the top of the page.",
      },

      "rich-content": {
        title: "Rich Content",

        description: "Flexible bilingual text with an optional image.",
      },

      "feature-grid": {
        title: "Feature Grid",

        description: "Display company values, services or strengths as cards.",
      },

      statistics: {
        title: "Statistics",

        description:
          "Show important company numbers and performance indicators.",
      },

      cta: {
        title: "Call to Action",

        description:
          "Encourage visitors to contact the company or explore products.",
      },
    },
  },

  content: {
    eyebrow: "Eyebrow",

    title: "Title",

    body: "Content",

    image: "Section Image",

    imageAlt: "Image Alternative Text",

    actions: "Buttons",

    items: "Items",

    value: "Value",

    icon: "Icon",

    buttonLabel: "Button Label",

    buttonUrl: "Button URL",

    openInNewTab: "Open in a new tab",

    noImage: "No image selected",

    imageHint: "Select an image from the Media Library.",
  },

  layout: {
    title: "Layout and Appearance",

    variant: "Layout",

    imagePosition: "Image Position",

    imageRatio: "Image Ratio",

    contentAlignment: "Content Alignment",

    background: "Background",

    variants: {
      "full-width": "Full Width",

      contained: "Contained",

      split: "Split Content",

      grid: "Grid",

      banner: "Banner",
    },

    imagePositions: {
      none: "No Image",

      left: "Image Left",

      right: "Image Right",

      background: "Background Image",
    },

    imageRatios: {
      auto: "Automatic",

      "16/9": "Landscape 16:9",

      "4/3": "Standard 4:3",

      "1/1": "Square 1:1",

      "3/4": "Portrait 3:4",
    },

    alignments: {
      left: "Left",

      center: "Center",

      right: "Right",
    },

    backgrounds: {
      white: "White",

      muted: "Muted",

      brand: "Brand",

      dark: "Dark",
    },
  },

  buttonStyles: {
    primary: "Primary",

    secondary: "Secondary",

    outline: "Outline",

    link: "Text Link",
  },

  languages: {
    english: "English",

    thai: "ภาษาไทย",

    en: "EN",

    th: "TH",

    contentAdded: "Content added",

    empty: "Empty",
  },

  confirmations: {
    deleteSection: {
      title: "Delete this section?",

      text: "The section will be removed from the draft. Save the draft to confirm the change.",

      confirm: "Delete Section",
    },

    publish: {
      title: "Publish About page?",

      text: "The current draft will replace the About page shown on the public website.",

      confirm: "Publish",
    },

    unpublish: {
      title: "Unpublish About page?",

      text: "The published About page will be removed and the public page will return to its fallback content.",

      confirm: "Unpublish",
    },

    reload: {
      title: "Discard unsaved changes?",

      text: "The latest saved draft will be loaded and local changes will be lost.",

      confirm: "Reload Draft",
    },
  },

  messages: {
    saveSuccess: "About page draft saved successfully.",

    saveFailed: "Unable to save the About page draft.",

    publishSuccess: "About page published successfully.",

    publishFailed: "Unable to publish the About page.",

    unpublishSuccess: "About page unpublished successfully.",

    unpublishFailed: "Unable to unpublish the About page.",

    reloadSuccess: "The latest About page draft has been loaded.",

    reloadFailed: "Unable to reload the About page.",

    versionConflict:
      "Another administrator updated this page. Reload the latest draft before continuing.",

    publishIncomplete:
      "Complete all required English and Thai content before publishing.",
  },
};

export default adminAboutEn;
