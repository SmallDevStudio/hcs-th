const accountEn = {
  eyebrow: "My Account",

  title: "Account & Security",

  description:
    "Manage your account security and connect LINE for administrator notifications.",

  profile: {
    eyebrow: "Administrator Profile",

    active: "Active account",
  },

  password: {
    title: "Change Password",

    description: "Confirm your current password before setting a new password.",

    currentPassword: "Current password",

    newPassword: "New password",

    confirmPassword: "Confirm new password",

    action: "Change password",

    changing: "Changing password...",

    messages: {
      changed: "Your password has been changed successfully.",
    },

    errors: {
      invalidCurrentPassword: "The current password is incorrect.",

      weakPassword: "The new password is not strong enough.",

      tooManyRequests: "Too many attempts. Please wait and try again.",

      reauthenticate: "Please confirm your current password again.",

      network: "Unable to connect to Firebase. Check your internet connection.",

      default: "Unable to change your password.",
    },
  },

  line: {
    title: "LINE Account",

    description:
      "Connect your LINE account to receive administrator notifications without manually entering a LINE User ID.",

    lineAccount: "LINE Account",

    connected: "Connected",

    connectedDescription:
      "This LINE account can be selected as a notification recipient in Site Settings.",

    notConnected: "LINE is not connected",

    notConnectedDescription:
      "Connect LINE to make this account available as a LINE notification recipient.",

    connect: "Connect LINE",

    disconnect: "Disconnect",

    disconnecting: "Disconnecting...",

    disconnectConfirmation: "Disconnect LINE from this administrator account?",

    messages: {
      connected: "LINE account connected successfully.",

      disconnected: "LINE account disconnected successfully.",

      cancelled: "LINE connection was cancelled.",

      connectFailed: "Unable to connect the LINE account.",

      disconnectFailed: "Unable to disconnect the LINE account.",
    },
  },
};

export default accountEn;
