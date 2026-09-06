import publicEn from "@/i18n/locales/public/en";
import publicTh from "@/i18n/locales/public/th";

import adminEn from "@/i18n/locales/admin/en";
import adminTh from "@/i18n/locales/admin/th";

import adminCoreEn from "@/i18n/locales/admin/core/en";
import adminCoreTh from "@/i18n/locales/admin/core/th";

import auditLogsEn from "@/i18n/locales/admin/audit-logs/en";
import auditLogsTh from "@/i18n/locales/admin/audit-logs/th";

import dashboardEn from "@/i18n/locales/admin/dashboard/en";
import dashboardTh from "@/i18n/locales/admin/dashboard/th";

import siteSettingsEn from "@/i18n/locales/admin/site-settings/en";
import siteSettingsTh from "@/i18n/locales/admin/site-settings/th";

import trashEn from "@/i18n/locales/admin/trash/en";
import trashTh from "@/i18n/locales/admin/trash/th";

export const i18nResources = {
  en: {
    public: publicEn,

    admin: {
      ...adminEn,
      core: adminCoreEn,
      auditLogs: auditLogsEn,
      dashboard: dashboardEn,
      siteSettings: siteSettingsEn,
      trash: trashEn,
    },
  },

  th: {
    public: publicTh,

    admin: {
      ...adminTh,
      core: adminCoreTh,
      auditLogs: auditLogsTh,
      dashboard: dashboardTh,
      siteSettings: siteSettingsTh,
      trash: trashTh,
    },
  },
};
