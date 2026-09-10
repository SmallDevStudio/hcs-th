const usersEn = {
  eyebrow: "Access Management",
  title: "Users",
  description:
    "Manage administrator accounts, roles, permission groups and account access.",

  common: {
    cancel: "Cancel",
    close: "Close",
  },

  actions: {
    create: "Add User",
    edit: "Edit User",
    delete: "Delete User",
    search: "Search",
    clear: "Clear Filters",
    refresh: "Refresh",
    loadMore: "Load More",
    passwordReset: "Reset Password",
    myAccount: "My Account",
    manageGroups: "Permission Groups",
    setPassword: "Set Password",
  },

  filters: {
    search: "Search users",
    searchPlaceholder: "Search by name, email, role or group...",
    role: "Role",
    status: "Status",
    allRoles: "All Roles",
    allStatuses: "All Statuses",
  },

  roles: {
    superadmin: "Superadmin",
    admin: "Administrator",
    editor: "Editor",
  },

  statuses: {
    active: "Active",
    inactive: "Inactive",
  },

  line: {
    connected: "Connected",
    disconnected: "Not connected",
  },

  table: {
    user: "User",
    role: "Role",
    groups: "Permission Groups",
    line: "LINE",
    status: "Status",
    lastLogin: "Last Login",
    actions: "Actions",
    noName: "Unnamed user",
    noGroups: "No groups",
    you: "You",
  },

  empty: {
    title: "No users found",
    description: "There are no administrator accounts to display.",
    filteredDescription:
      "No users match the selected filters. Try changing the search criteria.",
  },

  passwordReset: {
    title: "Send password reset email?",
    text: "A password reset link will be sent to {{name}}.",
    confirm: "Send Reset Email",
  },

  delete: {
    title: "Permanently delete this user?",
    text: "{{name}} will lose access immediately.",
    permanentWarning:
      "This action permanently deletes the Firebase Authentication account and user record. It cannot be undone.",
    confirm: "Permanently Delete",
    confirmationTitle: "Final confirmation",
    confirmationLabel: 'Type "DELETE" to permanently delete this user.',
    confirmationInvalid: 'Please type "DELETE" to continue.',
  },

  validation: {
    emailRequired: "Email address is required.",
    displayNameRequired: "Display name is required.",
    roleRequired: "Please select a role.",
    statusRequired: "Please select an account status.",
  },

  messages: {
    loadFailed: "Unable to load users.",
    createSuccess: "User created and password setup email sent successfully.",
    createSuccessEmailFailed:
      "User was created, but the password setup email could not be sent.",
    createFailed: "Unable to create user.",
    updateSuccess: "User updated successfully.",
    updateFailed: "Unable to update user.",
    deleteSuccess: "User permanently deleted.",
    deleteFailed: "Unable to delete user.",
    passwordResetSent: "Password reset email sent successfully.",
    passwordResetEmailFailed:
      "The reset request was recorded, but the email could not be sent.",
    passwordResetFailed: "Unable to send password reset email.",
    passwordSetSuccess: "User password updated successfully.",
    passwordSetFailed: "Unable to update the user password.",
  },

  form: {
    createEyebrow: "New Administrator",
    createTitle: "Add User",
    createDescription:
      "Create an administrator account and assign the appropriate access.",

    editEyebrow: "Account Access",
    editTitle: "Edit User",
    editDescription:
      "Update account status, role, permission groups and direct permissions.",

    accountInformation: "Account Information",
    accountInformationDescription:
      "Basic identity, language and access status.",

    email: "Email Address",
    emailCannotChange:
      "Email cannot be changed from this screen because it is linked to Firebase Authentication.",

    displayName: "Display Name",
    role: "Role",
    status: "Status",
    preferredLocale: "Preferred Language",

    languages: {
      th: "Thai",
      en: "English",
    },

    permissionGroups: "Permission Groups",
    permissionGroupsDescription:
      "Permissions from active groups are combined with direct permissions.",

    loadingGroups: "Loading permission groups...",
    groupsLoadFailed: "Unable to load permission groups.",
    noGroups: "No permission groups are available.",
    inactiveGroup: "Inactive",

    directPermissions: "Direct Permissions",
    directPermissionsDescription:
      "Assign permissions specifically to this user in addition to role and group permissions.",

    superadminAllPermissions:
      "Superadmins automatically receive complete access to every administration feature.",

    selectCategory: "Select all",
    clearCategory: "Clear",

    saving: "Saving...",
    saveChanges: "Save Changes",
    createUser: "Create User",
  },

  permissionCategories: {
    dashboard: "Dashboard",
    users: "Users",
    groups: "Permission Groups",
    siteSettings: "Site Settings",
    pages: "Pages",
    categories: "Categories",
    products: "Products",
    solutions: "Solutions",
    projects: "Projects",
    standards: "Standards",
    downloads: "Downloads",
    media: "Media Library",
    messages: "Messages",
    auditLogs: "Audit Logs",
    trash: "Trash",
  },

  permissionActions: {
    view: "View",
    create: "Create",
    update: "Update",
    delete: "Delete",
    publish: "Publish",
    upload: "Upload",
    restore: "Restore",
    deletePermanently: "Permanently delete",
  },

  password: {
    eyebrow: "Account Security",
    title: "Set User Password",
    description:
      "Set a new password for this user. Existing sessions will be signed out after the password is changed.",

    initialPassword: "Initial Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",

    showPassword: "Show password",
    hidePassword: "Hide password",

    forceChange: "Require password change at next login",
    forceChangeDescription:
      "The user can sign in with this password but must create a new password before accessing the administration system.",

    sessionWarning:
      "Changing the password will revoke the user's existing login sessions.",

    requirements:
      "Use at least 8 characters. Avoid passwords that are easy to guess.",

    saving: "Saving Password...",
    save: "Set Password",

    validation: {
      minimum: "Password must contain at least 8 characters.",
      maximum: "Password must not exceed 128 characters.",
      notMatched: "Password confirmation does not match.",
    },
  },
};

export default usersEn;
