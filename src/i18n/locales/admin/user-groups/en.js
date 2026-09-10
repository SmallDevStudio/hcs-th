const userGroupsEn = {
  eyebrow: "Role-Based Access",
  title: "Permission Groups",
  description:
    "Create reusable permission groups and assign them to administrator accounts.",

  loading: "Loading permission groups...",

  common: {
    cancel: "Cancel",
    close: "Close",
  },

  actions: {
    create: "Add Group",
    edit: "Edit Group",
    delete: "Delete Group",
    search: "Search",
    clear: "Clear Filters",
    refresh: "Refresh",
    loadMore: "Load More",
    viewUsers: "View Users",
  },

  filters: {
    search: "Search permission groups",
    searchPlaceholder: "Search by group name or description...",
    status: "Status",
    allStatuses: "All Statuses",
  },

  statuses: {
    active: "Active",
    inactive: "Inactive",
  },

  table: {
    group: "Permission Group",
    permissions: "Permissions",
    members: "Members",
    status: "Status",
    updatedAt: "Last Updated",
    actions: "Actions",
    noDescription: "No description",
    permissionCount: "{{count}} permissions",
  },

  empty: {
    title: "No permission groups found",
    description:
      "Create a permission group to reuse the same access rules across multiple users.",
    filteredDescription:
      "No permission groups match the selected filters. Try changing the search criteria.",
  },

  delete: {
    title: "Delete this permission group?",
    text: 'The permission group "{{name}}" will be permanently deleted.',
    confirm: "Delete Group",

    inUseTitle: "This group cannot be deleted",
    inUseText:
      "This permission group is currently assigned to {{count}} users. Remove the group from every user before deleting it.",
  },

  validation: {
    nameRequired: "Permission group name is required.",
  },

  messages: {
    loadFailed: "Unable to load permission groups.",
    createSuccess: "Permission group created successfully.",
    createFailed: "Unable to create permission group.",
    updateSuccess: "Permission group updated successfully.",
    updateFailed: "Unable to update permission group.",
    deleteSuccess: "Permission group deleted successfully.",
    deleteFailed: "Unable to delete permission group.",
  },

  form: {
    createEyebrow: "New Access Group",
    createTitle: "Add Permission Group",
    createDescription:
      "Create a reusable set of permissions for administrator accounts.",

    editEyebrow: "Group Access",
    editTitle: "Edit Permission Group",
    editDescription:
      "Update group information, status and assigned permissions.",

    groupInformation: "Group Information",
    groupInformationDescription:
      "Name, description and availability of this group.",

    name: "Group Name",
    description: "Description",
    status: "Status",

    members: "Assigned Users",
    membersDescription:
      "A permission group cannot be deleted while it is assigned to one or more users.",

    permissions: "Group Permissions",
    permissionsDescription:
      "Users assigned to this active group receive these permissions in addition to their role and direct permissions.",

    selectCategory: "Select all",
    clearCategory: "Clear",

    saving: "Saving...",
    saveChanges: "Save Changes",
    createGroup: "Create Group",
  },
};

export default userGroupsEn;
