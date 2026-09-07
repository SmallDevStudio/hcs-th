import publicEn from "@/i18n/locales/public/en";
import publicTh from "@/i18n/locales/public/th";

import publicProductsEn from "@/i18n/locales/public/products/en";
import publicProductsTh from "@/i18n/locales/public/products/th";

import adminEn from "@/i18n/locales/admin/en";
import adminTh from "@/i18n/locales/admin/th";

import adminCoreEn from "@/i18n/locales/admin/core/en";
import adminCoreTh from "@/i18n/locales/admin/core/th";

import auditLogsEn from "@/i18n/locales/admin/audit-logs/en";
import auditLogsTh from "@/i18n/locales/admin/audit-logs/th";

import categoriesEn from "@/i18n/locales/admin/categories/en";
import categoriesTh from "@/i18n/locales/admin/categories/th";

import dashboardEn from "@/i18n/locales/admin/dashboard/en";
import dashboardTh from "@/i18n/locales/admin/dashboard/th";

import mediaEn from "@/i18n/locales/admin/media/en";
import mediaTh from "@/i18n/locales/admin/media/th";

import productsEn from "@/i18n/locales/admin/products/en";
import productsTh from "@/i18n/locales/admin/products/th";

import solutionsEn from "@/i18n/locales/admin/solutions/en";
import solutionsTh from "@/i18n/locales/admin/solutions/th";

import siteSettingsEn from "@/i18n/locales/admin/site-settings/en";
import siteSettingsTh from "@/i18n/locales/admin/site-settings/th";

import trashEn from "@/i18n/locales/admin/trash/en";
import trashTh from "@/i18n/locales/admin/trash/th";

import publicSolutionsEn from "@/i18n/locales/public/solutions/en";
import publicSolutionsTh from "@/i18n/locales/public/solutions/th";

export const i18nResources = {
  en: {
    public: {
      ...publicEn,

      products: publicProductsEn,
      solutions: publicSolutionsEn,
    },

    admin: {
      ...adminEn,

      core: adminCoreEn,

      auditLogs: auditLogsEn,

      categories: categoriesEn,

      dashboard: dashboardEn,

      media: mediaEn,

      products: productsEn,

      solutions: solutionsEn,

      siteSettings: siteSettingsEn,

      trash: trashEn,
    },
  },

  th: {
    public: {
      ...publicTh,

      products: publicProductsTh,
      solutions: publicSolutionsTh,
    },

    admin: {
      ...adminTh,

      core: adminCoreTh,

      auditLogs: auditLogsTh,

      categories: categoriesTh,

      dashboard: dashboardTh,

      media: mediaTh,

      products: productsTh,

      solutions: solutionsTh,

      siteSettings: siteSettingsTh,

      trash: trashTh,
    },
  },
};
