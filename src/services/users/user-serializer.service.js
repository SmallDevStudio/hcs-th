import "server-only";

function serializeTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values.map((value) => String(value || "").trim()).filter(Boolean),
    ),
  ];
}

function serializeLineConnection(lineConnection) {
  const connected =
    lineConnection?.status === "connected" &&
    Boolean(String(lineConnection?.userId || "").trim());

  if (!connected) {
    return {
      status: "disconnected",

      displayName: "",

      pictureUrl: "",

      connectedAt: null,

      disconnectedAt: serializeTimestamp(lineConnection?.disconnectedAt),
    };
  }

  return {
    status: "connected",

    displayName: lineConnection.displayName || "",

    pictureUrl: lineConnection.pictureUrl || "",

    connectedAt: serializeTimestamp(lineConnection.connectedAt),

    disconnectedAt: null,
  };
}

export function serializeUserData({ uid, data, resolvedAccess = null }) {
  const directPermissions =
    resolvedAccess?.directPermissions || normalizeStringArray(data.permissions);

  const groupIds =
    resolvedAccess?.groupIds || normalizeStringArray(data.groupIds);

  return {
    uid,

    email: data.email || "",

    displayName: data.displayName || "",

    photoURL: data.photoURL || null,

    role: data.role || "",

    permissions: directPermissions,

    groupIds,

    groups: resolvedAccess?.groups || [],

    groupPermissions: resolvedAccess?.groupPermissions || [],

    effectivePermissions:
      resolvedAccess?.effectivePermissions || directPermissions,

    status: data.status || "",

    preferredLocale: data.preferredLocale || "th",

    mustChangePassword: Boolean(data.mustChangePassword),

    lineConnection: serializeLineConnection(data.lineConnection),

    lastLoginAt: serializeTimestamp(data.lastLoginAt),

    passwordChangedAt: serializeTimestamp(data.passwordChangedAt),

    passwordResetRequestedAt: serializeTimestamp(data.passwordResetRequestedAt),

    createdAt: serializeTimestamp(data.createdAt),

    createdBy: data.createdBy || null,

    updatedAt: serializeTimestamp(data.updatedAt),

    updatedBy: data.updatedBy || null,
  };
}

export function serializeUserDocument({ snapshot, resolvedAccess = null }) {
  if (!snapshot?.exists) {
    return null;
  }

  return serializeUserData({
    uid: snapshot.id,

    data: snapshot.data(),

    resolvedAccess,
  });
}

export function createUserAuditSnapshot({ uid, data }) {
  return {
    uid,

    email: data.email || "",

    displayName: data.displayName || "",

    role: data.role || "",

    status: data.status || "",

    preferredLocale: data.preferredLocale || "th",

    permissions: normalizeStringArray(data.permissions),

    groupIds: normalizeStringArray(data.groupIds),

    mustChangePassword: Boolean(data.mustChangePassword),

    lineConnected: data.lineConnection?.status === "connected",
  };
}
