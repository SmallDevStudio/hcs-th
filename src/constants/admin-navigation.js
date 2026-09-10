import {
  FiActivity,
  FiBookOpen,
  FiBox,
  FiBriefcase,
  FiFolder,
  FiGrid,
  FiHome,
  FiImage,
  FiInbox,
  FiLayers,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";

export const ADMIN_NAVIGATION = [
  {
    key: "dashboard",
    labelKey: "navigation.dashboard",
    href: "/admin/dashboard",
    icon: FiGrid,
    permission: ADMIN_PERMISSIONS.DASHBOARD_VIEW,
  },

  {
    key: "content",
    labelKey: "navigation.groups.content",

    items: [
      {
        key: "home",
        labelKey: "navigation.home",
        href: "/admin/home",
        icon: FiHome,
        permission: ADMIN_PERMISSIONS.PAGES_VIEW,
      },
      {
        key: "site-settings",
        labelKey: "navigation.siteSettings",
        href: "/admin/site-settings",
        icon: FiSettings,
        permission: ADMIN_PERMISSIONS.SITE_SETTINGS_VIEW,
      },
    ],
  },

  {
    key: "catalog",
    labelKey: "navigation.groups.catalog",

    items: [
      {
        key: "products",
        labelKey: "navigation.products",
        href: "/admin/products",
        icon: FiBox,
        permission: ADMIN_PERMISSIONS.PRODUCTS_VIEW,
      },
      {
        key: "categories",
        labelKey: "navigation.categories",
        href: "/admin/categories",
        icon: FiFolder,
        permission: ADMIN_PERMISSIONS.CATEGORIES_VIEW,
      },
      {
        key: "solutions",
        labelKey: "navigation.solutions",
        href: "/admin/solutions",
        icon: FiLayers,
        permission: ADMIN_PERMISSIONS.SOLUTIONS_VIEW,
      },
    ],
  },

  {
    key: "business",
    labelKey: "navigation.groups.business",

    items: [
      {
        key: "projects",
        labelKey: "navigation.projects",
        href: "/admin/projects",
        icon: FiBriefcase,
        permission: ADMIN_PERMISSIONS.PROJECTS_VIEW,
      },
      {
        key: "standards",
        labelKey: "navigation.standards",
        href: "/admin/standards",
        icon: FiShield,
        permission: ADMIN_PERMISSIONS.STANDARDS_VIEW,
      },
      {
        key: "media",
        labelKey: "navigation.media",
        href: "/admin/media",
        icon: FiImage,
        permission: ADMIN_PERMISSIONS.MEDIA_VIEW,
      },
    ],
  },

  {
    key: "communication",
    labelKey: "navigation.groups.communication",

    items: [
      {
        key: "messages",
        labelKey: "navigation.messages",
        href: "/admin/messages",
        icon: FiInbox,
        permission: ADMIN_PERMISSIONS.MESSAGES_VIEW,
      },
    ],
  },

  {
    key: "system",
    labelKey: "navigation.groups.system",

    items: [
      {
        key: "users",
        labelKey: "navigation.users",
        href: "/admin/users",
        icon: FiUsers,
        permission: ADMIN_PERMISSIONS.USERS_VIEW,
      },
      {
        key: "user-groups",
        labelKey: "navigation.userGroups",
        href: "/admin/user-groups",
        icon: FiUserCheck,
        permission: ADMIN_PERMISSIONS.GROUPS_VIEW,
      },
      {
        key: "audit-logs",
        labelKey: "navigation.auditLogs",
        href: "/admin/audit-logs",
        icon: FiActivity,
        permission: ADMIN_PERMISSIONS.AUDIT_LOGS_VIEW,
      },
      {
        key: "trash",
        labelKey: "navigation.trash",
        href: "/admin/trash",
        icon: FiTrash2,
        permission: ADMIN_PERMISSIONS.TRASH_VIEW,
      },
      {
        key: "manual",
        labelKey: "navigation.manual",
        href: "/admin/manual",
        icon: FiBookOpen,
      },
    ],
  },
];

export function canViewAdminNavigationItem(item, admin) {
  if (!item.permission) {
    return true;
  }

  return hasPermission(admin?.permissions || [], item.permission);
}
