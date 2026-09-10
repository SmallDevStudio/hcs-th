const siteSettingsEn = {
  eyebrow: "Website Settings",

  title: "Site Information",

  description:
    "Manage company information, contact channels, branding, SEO and notifications.",

  actions: {
    save: "Save changes",

    saving: "Saving...",

    saved: "Site settings updated successfully",

    saveFailed: "Unable to update site settings",
  },

  tabs: {
    company: "Company",

    contact: "Contact",

    social: "Social Media",

    brandingSeo: "Branding & SEO",

    integrations: "Integrations",

    notifications: "Notifications",
  },

  sections: {
    company: {
      title: "Company Information",

      description:
        "General information displayed throughout the public website.",
    },

    contact: {
      title: "Contact Information",

      description:
        "Phone numbers, email addresses, location and business hours.",
    },

    social: {
      title: "Social Media",

      description: "Links used by the header, footer and contact pages.",
    },

    branding: {
      title: "Branding",

      description:
        "Primary colors, company logos and the default social sharing image.",
    },

    seo: {
      title: "Default SEO",

      description:
        "Fallback metadata used when an individual page has no SEO information.",
    },

    integrations: {
      title: "Search Engine & Analytics",

      description:
        "Verification codes and analytics configuration for the website.",
    },
  },

  notifications: {
    channels: {
      title: "Notification Channels",

      description:
        "Choose how administrators are notified when a new website enquiry is received.",

      inApp: "In-app",

      inAppDescription:
        "Display new enquiries and unread status in the Admin Panel.",

      email: "Email",

      emailDescription:
        "Send enquiry details to the configured email recipients.",

      line: "LINE",

      lineDescription:
        "Send enquiry alerts to selected users through the LINE Messaging API.",
    },

    email: {
      title: "Email Notification",

      description:
        "Configure the SMTP server and recipients used for website enquiry notifications.",

      smtpTitle: "SMTP Configuration",

      smtpDescription: "The SMTP password is encrypted before being stored.",
    },

    line: {
      title: "LINE Notification",

      description:
        "Configure LINE Messaging API, LINE Login and select connected users who receive alerts.",

      messagingApiTitle: "LINE Messaging API",

      messagingApiDescription:
        "Uses a LINE Official Account channel access token to send push messages.",

      loginTitle: "LINE Login Connection",

      loginDescription:
        "LINE Login securely links each administrator account to LINE without manually entering a LINE User ID.",

      noConnectedUsers: "No connected LINE users",

      noConnectedUsersDescription:
        "Users will appear here after connecting LINE from their account page. Only active and connected users can be selected.",

      connected: "Connected",
    },

    fields: {
      smtpHost: "SMTP host",

      smtpPort: "SMTP port",

      smtpSecure: "Use secure SMTP connection",

      smtpSecureDescription:
        "Enable for implicit TLS, normally used with port 465.",

      smtpUsername: "SMTP username",

      smtpPassword: "SMTP password",

      fromName: "Sender name",

      fromEmail: "Sender email",

      emailRecipients: "Notification recipients",

      lineToken: "Channel access token",

      lineLoginChannelId: "LINE Login channel ID",

      lineLoginChannelSecret: "LINE Login channel secret",

      lineRecipients: "LINE notification recipients",
    },

    placeholders: {
      smtpPassword: "Enter the SMTP password",

      lineToken: "Enter the LINE Messaging API channel access token",

      lineLoginChannelSecret: "Enter the LINE Login channel secret",

      secretConfigured:
        "A secret is already configured. Leave empty to keep it unchanged.",

      emailRecipients: "sales@hcsthailand.com\nsupport@hcsthailand.com",
    },

    hints: {
      secret: "Leave this field empty to keep the currently saved secret.",

      multipleValues:
        "Enter one value per line. Commas and semicolons are also supported.",

      lineRecipients:
        "Only active users who have connected their LINE account are available for selection.",
    },

    status: {
      passwordConfigured: "SMTP password configured",

      passwordMissing: "SMTP password not configured",

      tokenConfigured: "LINE token configured",

      tokenMissing: "LINE token not configured",

      loginSecretConfigured: "LINE Login secret configured",

      loginSecretMissing: "LINE Login secret not configured",
    },

    actions: {
      testEmail: "Send test email",

      testingEmail: "Sending test email...",

      testLine: "Send test LINE",

      testingLine: "Sending test LINE...",

      reloadUsers: "Reload users",
    },

    messages: {
      saveBeforeTest: "Save the notification settings before testing.",

      recipientRequired: "Enter at least one notification recipient.",

      lineRecipientRequired: "Select at least one connected LINE user.",

      emailTestSent: "Test email sent successfully to {{email}}.",

      emailTestFailed: "Unable to send the test email.",

      lineTestSent: "LINE test notification sent to {{count}} user(s).",

      lineTestFailed: "Unable to send the LINE test notification.",

      lineRecipientsLoadFailed: "Unable to load connected LINE users.",
    },
  },

  language: {
    english: "English",

    thai: "Thai",
  },

  fields: {
    displayName: "Display name",

    legalName: "Legal company name",

    tagline: "Tagline",

    description: "Company description",

    registrationNumber: "Registration number",

    foundedYear: "Founded year",

    phone: "Primary phone",

    secondaryPhone: "Secondary phone",

    email: "General email",

    salesEmail: "Sales email",

    address: "Address",

    googleMapsUrl: "Google Maps URL",

    googleMapsEmbedUrl: "Google Maps embed URL",

    lineId: "LINE ID",

    businessHours: "Business hours",

    facebook: "Facebook URL",

    instagram: "Instagram URL",

    youtube: "YouTube URL",

    linkedin: "LinkedIn URL",

    line: "LINE URL",

    primaryColor: "Primary color",

    secondaryColor: "Secondary color",

    logoPrimary: "Primary logo",

    logoWhite: "White logo",

    defaultOgImage: "Default Open Graph image",

    indexable: "Allow search engine indexing",

    indexableDescription:
      "Search engines may index and display the public website.",

    seoTitle: "SEO title",

    seoDescription: "SEO description",

    seoKeywords: "SEO keywords",

    googleSiteVerification: "Google site verification",

    bingSiteVerification: "Bing site verification",

    googleAnalyticsMeasurementId: "Google Analytics measurement ID",
  },

  placeholders: {
    displayName: "HCS Thailand",

    legalName: "HCS (Thailand) Co., Ltd.",

    tagline: "Hardware & Security Solutions",

    description: "Describe the company and its services",

    registrationNumber: "Company registration number",

    foundedYear: "2020",

    phone: "+66 2 038 9650",

    secondaryPhone: "Additional phone number",

    email: "info@hcsthailand.com",

    salesEmail: "sales@hcsthailand.com",

    address: "Company address",

    googleMapsUrl: "https://maps.google.com/...",

    googleMapsEmbedUrl: "https://www.google.com/maps/embed?...",

    lineId: "@hcsthailand",

    businessHours: "Monday – Friday, 08:30 – 17:30",

    socialUrl: "https://...",

    logoPath: "/images/brand/...",

    ogImagePath: "/images/seo/...",

    seoTitle: "Page title displayed by search engines",

    seoDescription: "Short description displayed by search engines",

    seoKeywords: "door hardware, door closer, security solutions",

    googleSiteVerification: "Google verification token",

    bingSiteVerification: "Bing verification token",

    googleAnalyticsMeasurementId: "G-XXXXXXXXXX",
  },

  hints: {
    localized: "Enter the content separately for English and Thai.",

    keywords:
      "Separate each keyword with a comma. A maximum of 30 keywords is allowed.",

    seoAutoFill:
      "If left empty, the system generates this value from the company name, tagline and description.",

    imagePath: "Enter a path from the media library or a public image path.",

    verification:
      "Enter only the verification token, not the complete HTML meta tag.",

    analytics:
      "Changes to Analytics may require a new deployment depending on the tracking configuration.",
  },

  counter: {
    title: "{{count}}/70 characters",

    description: "{{count}}/180 characters",
  },

  validation: {
    invalidUrl: "Please enter a valid URL.",

    invalidEmail: "Please enter a valid email address.",

    invalidColor: "Please enter a valid hexadecimal color.",

    invalidYear: "Please enter a four-digit year.",
  },

  status: {
    neverUpdated: "These settings have not been saved yet.",

    lastUpdated: "Last updated {{date}}",
  },
};

export default siteSettingsEn;
