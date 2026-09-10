import publicEn from "@/i18n/locales/public/en";
import publicTh from "@/i18n/locales/public/th";

import publicProductsEn from "@/i18n/locales/public/products/en";
import publicProductsTh from "@/i18n/locales/public/products/th";

import adminEn from "@/i18n/locales/admin/en";
import adminTh from "@/i18n/locales/admin/th";

import adminCoreEn from "@/i18n/locales/admin/core/en";
import adminCoreTh from "@/i18n/locales/admin/core/th";

import adminAboutEn from "@/i18n/locales/admin/about/en";
import adminAboutTh from "@/i18n/locales/admin/about/th";

import auditLogsEn from "@/i18n/locales/admin/audit-logs/en";
import auditLogsTh from "@/i18n/locales/admin/audit-logs/th";

import categoriesEn from "@/i18n/locales/admin/categories/en";
import categoriesTh from "@/i18n/locales/admin/categories/th";

import dashboardEn from "@/i18n/locales/admin/dashboard/en";
import dashboardTh from "@/i18n/locales/admin/dashboard/th";

import homeEn from "@/i18n/locales/admin/home/en";
import homeTh from "@/i18n/locales/admin/home/th";

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

import projectsEn from "@/i18n/locales/admin/projects/en";
import projectsTh from "@/i18n/locales/admin/projects/th";

import publicProjectsEn from "@/i18n/locales/public/projects/en";
import publicProjectsTh from "@/i18n/locales/public/projects/th";

import standardsEn from "@/i18n/locales/admin/standards/en";
import standardsTh from "@/i18n/locales/admin/standards/th";

import publicStandardsEn from "@/i18n/locales/public/standards/en";
import publicStandardsTh from "@/i18n/locales/public/standards/th";

import contactEn from "@/i18n/locales/public/contact/en";
import contactTh from "@/i18n/locales/public/contact/th";

import aboutEn from "@/i18n/locales/public/about/en";
import aboutTh from "@/i18n/locales/public/about/th";

import messagesEn from "@/i18n/locales/admin/messages/en";
import messagesTh from "@/i18n/locales/admin/messages/th";

import accountEn from "@/i18n/locales/admin/account/en";
import accountTh from "@/i18n/locales/admin/account/th";

import usersEn from "@/i18n/locales/admin/users/en";
import usersTh from "@/i18n/locales/admin/users/th";

import userGroupsEn from "@/i18n/locales/admin/user-groups/en";
import userGroupsTh from "@/i18n/locales/admin/user-groups/th";

export const i18nResources = {
  en: {
    public: {
      ...publicEn,

      products: publicProductsEn,
      solutions: publicSolutionsEn,
      projects: publicProjectsEn,
      standards: publicStandardsEn,
      contact: contactEn,
      about: aboutEn,
    },

    admin: {
      ...adminEn,
      core: adminCoreEn,
      about: adminAboutEn,
      auditLogs: auditLogsEn,
      categories: categoriesEn,
      dashboard: dashboardEn,
      home: homeEn,
      media: mediaEn,
      products: productsEn,
      projects: projectsEn,
      solutions: solutionsEn,
      standards: standardsEn,
      siteSettings: siteSettingsEn,
      trash: trashEn,
      messages: messagesEn,
      account: accountEn,
      users: usersEn,
      userGroups: userGroupsEn,
    },
  },

  th: {
    public: {
      ...publicTh,

      products: publicProductsTh,
      solutions: publicSolutionsTh,
      projects: publicProjectsTh,
      standards: publicStandardsTh,
      contact: contactTh,
      about: aboutTh,
    },

    admin: {
      ...adminTh,
      core: adminCoreTh,
      about: adminAboutTh,
      auditLogs: auditLogsTh,
      categories: categoriesTh,
      dashboard: dashboardTh,
      home: homeTh,
      media: mediaTh,
      products: productsTh,
      projects: projectsTh,
      solutions: solutionsTh,
      standards: standardsTh,
      siteSettings: siteSettingsTh,
      trash: trashTh,
      messages: messagesTh,
      account: accountTh,
      users: usersTh,
      userGroups: userGroupsTh,
    },
  },
};
