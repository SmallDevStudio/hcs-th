const adminEn = {
  common: {
    adminPanel: "Admin Panel",
    administration: "HCS Administration",
    websiteManagement: "Website Management",
    viewWebsite: "View Website",
    logout: "Sign Out",
    loggingOut: "Signing out...",
    changeLanguage: "Change language",
    languageUpdated: "Language updated",
    languageUpdateFailed: "Unable to update language",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    restore: "Restore",
    search: "Search",
    actions: "Actions",
    loading: "Loading...",
    noData: "No data found",
  },

  roles: {
    superadmin: "Super Admin",
    admin: "Administrator",
    editor: "Editor",
  },

  navigation: {
    dashboard: "Dashboard",

    groups: {
      content: "Content Management",
      catalog: "Products & Services",
      business: "Company Information",
      communication: "Communication",
      system: "System",
    },

    home: "Home Page",
    pages: "Website Pages",
    siteSettings: "Site Settings",

    products: "Products",
    categories: "Product Categories",
    solutions: "Solutions",

    projects: "Project References",
    standards: "Standards & Certificates",
    downloads: "Downloads",
    media: "Media Library",

    messages: "Contact Messages",

    users: "Administrators",
    auditLogs: "Audit Logs",
    trash: "Trash",
    manual: "User Manual",
  },

  header: {
    title: "Website Management",
    subtitle: "HCS Thailand Content Management System",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
  },

  dashboard: {
    eyebrow: "HCS Administration",
    welcome: "Welcome, {{name}}",
    description:
      "Manage the content, information and settings of the HCS Thailand website.",
    permission: "User Role",

    overview: "Overview",
    overviewTitle: "Website Overview",

    statistics: {
      products: "Products",
      categories: "Categories",
      projects: "Projects",
      media: "Media Files",
    },

    gettingStarted: "Getting Started",
    readyTitle: "The system is ready for content modules",
    readyDescription:
      "Dashboard statistics will be connected to Firestore after the product, category, project and media modules are completed.",
  },

  login: {
    eyebrow: "Administrator",
    title: "Admin Sign In",
    description: "Enter your administrator email and password.",

    email: "Email",
    emailPlaceholder: "admin@hcsthailand.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",

    submit: "Sign In",
    submitting: "Signing in...",
    restricted: "This system is for HCS Thailand administrators only.",

    panelEyebrow: "HCS Content Management System",
    panelTitle: "Professional",
    panelTitleHighlight: "Website Management",
    panelDescription:
      "Manage HCS Thailand website content and important information from one central system.",

    features: {
      data: {
        title: "Manage all content",
        description:
          "Products, categories, projects, downloads and website content.",
      },
      central: {
        title: "Centralized management",
        description:
          "Manage English and Thai content through a structured system.",
      },
      seo: {
        title: "SEO ready",
        description: "Manage metadata and information used by search engines.",
      },
    },

    validation: {
      emailRequired: "Please enter your email.",
      emailInvalid: "Please enter a valid email address.",
      passwordRequired: "Please enter your password.",
      passwordMinimum: "Password must contain at least 8 characters.",
    },

    errors: {
      invalidCredential: "The email or password is incorrect.",
      invalidEmail: "The email address is invalid.",
      userDisabled: "This account has been suspended.",
      tooManyRequests:
        "There have been too many failed attempts. Please try again later.",
      network: "Unable to connect to the system. Please check your connection.",
      default: "Unable to sign in. Please try again.",
    },
  },

  siteSettings: {
    eyebrow: "Website Settings",
    title: "Site Information",
    description:
      "Manage company information, contact channels, social media and default SEO.",

    tabs: {
      company: "Company",
      contact: "Contact",
      social: "Social Media",
      seo: "Default SEO",
      integrations: "Integrations",
    },
  },
};

export default adminEn;
