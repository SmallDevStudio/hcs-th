"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiSave,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { toast } from "sonner";

import {
  ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_VALUES,
  ADMIN_ROLES,
  USER_STATUSES,
} from "@/constants/admin";
import { createUser, updateUser } from "@/services/http/users.api";
import { getUserGroups } from "@/services/http/user-groups.api";

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

function createInitialValues(user, availableRoles, availableStatuses) {
  return {
    email: user?.email || "",

    displayName: user?.displayName || "",

    password: "",

    confirmPassword: "",

    mustChangePassword: true,

    role:
      user?.role ||
      availableRoles.find((role) => role !== ADMIN_ROLES.SUPERADMIN) ||
      ADMIN_ROLES.EDITOR,

    status: user?.status || availableStatuses[0] || USER_STATUSES.ACTIVE,

    preferredLocale: user?.preferredLocale || "th",

    permissions: normalizeStringArray(user?.permissions),

    groupIds: normalizeStringArray(user?.groupIds),
  };
}

function permissionCategory(permission) {
  const [category] = String(permission || "").split(".");

  return category || "other";
}

function permissionAction(permission) {
  const [, action] = String(permission || "").split(".");

  return action || permission;
}

function canActorAssignPermission(currentUser, permission) {
  if (currentUser?.role === ADMIN_ROLES.SUPERADMIN) {
    return true;
  }

  const effectivePermissions = normalizeStringArray(
    currentUser?.effectivePermissions || currentUser?.permissions,
  );

  return (
    effectivePermissions.includes(ADMIN_PERMISSIONS.ALL) ||
    effectivePermissions.includes(permission)
  );
}

function PermissionCheckbox({
  permission,
  checked,
  disabled,
  onChange,
  label,
}) {
  return (
    <label
      className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
        checked
          ? "border-primary/40 bg-primary/5"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
      />

      <span className="min-w-0 text-xs font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
    </label>
  );
}

export function UserFormModal({
  mode = "create",
  user = null,
  currentUser,
  availableRoles = [],
  availableStatuses = [],
  onClose,
  onSaved,
}) {
  const { t } = useTranslation("admin");

  const isEditing = mode === "edit" && Boolean(user?.uid);

  const [values, setValues] = useState(() =>
    createInitialValues(user, availableRoles, availableStatuses),
  );

  const [groups, setGroups] = useState([]);

  const [groupsLoading, setGroupsLoading] = useState(true);

  const [groupsError, setGroupsError] = useState("");

  const [saving, setSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const assignablePermissions = useMemo(
    () =>
      ADMIN_PERMISSION_VALUES.filter(
        (permission) =>
          permission !== ADMIN_PERMISSIONS.ALL &&
          canActorAssignPermission(currentUser, permission),
      ),
    [currentUser],
  );

  const permissionSections = useMemo(() => {
    const sections = new Map();

    for (const permission of assignablePermissions) {
      const category = permissionCategory(permission);

      const currentPermissions = sections.get(category) || [];

      currentPermissions.push(permission);

      sections.set(category, currentPermissions);
    }

    return [...sections.entries()].map(([category, permissions]) => ({
      category,
      permissions,
    }));
  }, [assignablePermissions]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGroups() {
      try {
        const result = await getUserGroups({
          limit: 100,
          signal: controller.signal,
        });

        const selectedGroupIds = new Set(normalizeStringArray(user?.groupIds));

        const selectableGroups = result.items.filter(
          (group) =>
            group.status === "active" || selectedGroupIds.has(group.id),
        );

        setGroups(selectableGroups);
        setGroupsError("");
      } catch (error) {
        if (error?.name === "CanceledError" || error?.name === "AbortError") {
          return;
        }

        setGroupsError(error?.message || t("users.form.groupsLoadFailed"));
      } finally {
        if (!controller.signal.aborted) {
          setGroupsLoading(false);
        }
      }
    }

    void loadGroups();

    return () => {
      controller.abort();
    };
  }, [t, user?.groupIds]);

  function updateValue(field, value) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function togglePermission(permission) {
    setValues((current) => {
      const currentPermissions = new Set(current.permissions);

      if (currentPermissions.has(permission)) {
        currentPermissions.delete(permission);
      } else {
        currentPermissions.add(permission);
      }

      return {
        ...current,
        permissions: [...currentPermissions],
      };
    });
  }

  function togglePermissionCategory(permissions) {
    setValues((current) => {
      const currentPermissions = new Set(current.permissions);

      const allSelected = permissions.every((permission) =>
        currentPermissions.has(permission),
      );

      for (const permission of permissions) {
        if (allSelected) {
          currentPermissions.delete(permission);
        } else {
          currentPermissions.add(permission);
        }
      }

      return {
        ...current,
        permissions: [...currentPermissions],
      };
    });
  }

  function toggleGroup(groupId) {
    setValues((current) => {
      const selectedGroupIds = new Set(current.groupIds);

      if (selectedGroupIds.has(groupId)) {
        selectedGroupIds.delete(groupId);
      } else {
        selectedGroupIds.add(groupId);
      }

      return {
        ...current,
        groupIds: [...selectedGroupIds],
      };
    });
  }

  function validateValues() {
    if (!isEditing && !values.email.trim()) {
      toast.error(t("users.validation.emailRequired"));

      return false;
    }

    if (!values.displayName.trim()) {
      toast.error(t("users.validation.displayNameRequired"));

      return false;
    }

    if (!isEditing && values.password.length < 8) {
      toast.error(t("users.password.validation.minimum"));

      return false;
    }

    if (!isEditing && values.password.length > 128) {
      toast.error(t("users.password.validation.maximum"));

      return false;
    }

    if (!isEditing && values.password !== values.confirmPassword) {
      toast.error(t("users.password.validation.notMatched"));

      return false;
    }

    if (!values.role) {
      toast.error(t("users.validation.roleRequired"));

      return false;
    }

    if (!values.status) {
      toast.error(t("users.validation.statusRequired"));

      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateValues()) {
      return;
    }

    setSaving(true);

    const commonPayload = {
      displayName: values.displayName.trim(),

      role: values.role,

      status: values.status,

      preferredLocale: values.preferredLocale,

      permissions: normalizeStringArray(values.permissions),

      groupIds: normalizeStringArray(values.groupIds),
    };

    try {
      if (isEditing) {
        const savedUser = await updateUser({
          userId: user.uid,

          values: commonPayload,
        });

        toast.success(t("users.messages.updateSuccess"));

        onSaved(savedUser);

        return;
      }

      const savedUser = await createUser({
        values: {
          ...commonPayload,

          email: values.email.trim().toLowerCase(),

          password: values.password,

          confirmPassword: values.confirmPassword,

          mustChangePassword: values.mustChangePassword,
        },
      });

      toast.success(t("users.messages.createSuccess"));

      onSaved(savedUser);
    } catch (error) {
      toast.error(
        error?.message ||
          (isEditing
            ? t("users.messages.updateFailed")
            : t("users.messages.createFailed")),
      );
    } finally {
      setSaving(false);
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !saving) {
      onClose();
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-[#071522]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {isEditing
                ? t("users.form.editEyebrow")
                : t("users.form.createEyebrow")}
            </p>

            <h2
              id="user-form-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white"
            >
              {isEditing
                ? t("users.form.editTitle")
                : t("users.form.createTitle")}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isEditing
                ? t("users.form.editDescription")
                : t("users.form.createDescription")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t("users.common.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50 dark:border-slate-700"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(100vh-190px)] overflow-y-auto">
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FiUser aria-hidden="true" />
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                        {t("users.form.accountInformation")}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("users.form.accountInformationDescription")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t("users.form.email")}
                        {!isEditing ? (
                          <span className="ml-1 text-red-500">*</span>
                        ) : null}
                      </span>

                      <input
                        type="email"
                        value={values.email}
                        disabled={isEditing || saving}
                        onChange={(event) =>
                          updateValue("email", event.target.value)
                        }
                        autoComplete="off"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900"
                      />

                      {isEditing ? (
                        <span className="mt-1.5 block text-xs text-slate-400">
                          {t("users.form.emailCannotChange")}
                        </span>
                      ) : null}
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t("users.form.displayName")}
                        <span className="ml-1 text-red-500">*</span>
                      </span>

                      <input
                        type="text"
                        value={values.displayName}
                        disabled={saving}
                        onChange={(event) =>
                          updateValue("displayName", event.target.value)
                        }
                        maxLength={120}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </label>

                    {!isEditing ? (
                      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                              {t("users.password.initialPassword")}
                              <span className="ml-1 text-red-500">*</span>
                            </span>

                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={values.password}
                                disabled={saving}
                                minLength={8}
                                maxLength={128}
                                autoComplete="new-password"
                                onChange={(event) =>
                                  updateValue("password", event.target.value)
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setShowPassword((current) => !current)
                                }
                                aria-label={
                                  showPassword
                                    ? t("users.password.hidePassword")
                                    : t("users.password.showPassword")
                                }
                                className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                              >
                                {showPassword ? (
                                  <FiEyeOff aria-hidden="true" />
                                ) : (
                                  <FiEye aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          </label>

                          <label className="block">
                            <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                              {t("users.password.confirmPassword")}
                              <span className="ml-1 text-red-500">*</span>
                            </span>

                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={values.confirmPassword}
                                disabled={saving}
                                minLength={8}
                                maxLength={128}
                                autoComplete="new-password"
                                onChange={(event) =>
                                  updateValue(
                                    "confirmPassword",
                                    event.target.value,
                                  )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword((current) => !current)
                                }
                                aria-label={
                                  showConfirmPassword
                                    ? t("users.password.hidePassword")
                                    : t("users.password.showPassword")
                                }
                                className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                              >
                                {showConfirmPassword ? (
                                  <FiEyeOff aria-hidden="true" />
                                ) : (
                                  <FiEye aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          </label>
                        </div>

                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {t("users.password.requirements")}
                        </p>

                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={values.mustChangePassword}
                            disabled={saving}
                            onChange={(event) =>
                              updateValue(
                                "mustChangePassword",
                                event.target.checked,
                              )
                            }
                            className="mt-0.5 size-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />

                          <span>
                            <span className="block text-sm font-bold text-slate-900 dark:text-white">
                              {t("users.password.forceChange")}
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {t("users.password.forceChangeDescription")}
                            </span>
                          </span>
                        </label>
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                          {t("users.form.role")}
                          <span className="ml-1 text-red-500">*</span>
                        </span>

                        <select
                          value={values.role}
                          disabled={saving}
                          onChange={(event) =>
                            updateValue("role", event.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>
                              {t(`users.roles.${role}`)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                          {t("users.form.status")}
                          <span className="ml-1 text-red-500">*</span>
                        </span>

                        <select
                          value={values.status}
                          disabled={saving}
                          onChange={(event) =>
                            updateValue("status", event.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                          {availableStatuses.map((status) => (
                            <option key={status} value={status}>
                              {t(`users.statuses.${status}`)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t("users.form.preferredLocale")}
                      </span>

                      <select
                        value={values.preferredLocale}
                        disabled={saving}
                        onChange={(event) =>
                          updateValue("preferredLocale", event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      >
                        <option value="th">
                          {t("users.form.languages.th")}
                        </option>

                        <option value="en">
                          {t("users.form.languages.en")}
                        </option>
                      </select>
                    </label>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                      <FiUsers aria-hidden="true" />
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                        {t("users.form.permissionGroups")}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("users.form.permissionGroupsDescription")}
                      </p>
                    </div>
                  </div>

                  {groupsLoading ? (
                    <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-slate-500">
                      <FiLoader className="animate-spin" aria-hidden="true" />

                      <span>{t("users.form.loadingGroups")}</span>
                    </div>
                  ) : groupsError ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                      {groupsError}
                    </p>
                  ) : groups.length ? (
                    <div className="space-y-2">
                      {groups.map((group) => {
                        const checked = values.groupIds.includes(group.id);

                        return (
                          <label
                            key={group.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                              checked
                                ? "border-primary/40 bg-primary/5"
                                : "border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={saving}
                              onChange={() => toggleGroup(group.id)}
                              className="mt-0.5 size-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                {group.name}

                                {group.status !== "active" ? (
                                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-600 dark:bg-red-950/40">
                                    {t("users.form.inactiveGroup")}
                                  </span>
                                ) : null}
                              </span>

                              {group.description ? (
                                <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                                  {group.description}
                                </span>
                              ) : null}
                            </span>

                            {checked ? (
                              <FiCheck
                                className="mt-0.5 shrink-0 text-primary"
                                aria-hidden="true"
                              />
                            ) : null}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      {t("users.form.noGroups")}
                    </p>
                  )}
                </section>
              </div>

              <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                    <FiShield aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                      {t("users.form.directPermissions")}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("users.form.directPermissionsDescription")}
                    </p>
                  </div>
                </div>

                {values.role === ADMIN_ROLES.SUPERADMIN ? (
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm leading-6 text-purple-700 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-300">
                    {t("users.form.superadminAllPermissions")}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {permissionSections.map(({ category, permissions }) => {
                      const allSelected = permissions.every((permission) =>
                        values.permissions.includes(permission),
                      );

                      return (
                        <div key={category}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                              {t(`users.permissionCategories.${category}`, {
                                defaultValue: category,
                              })}
                            </h4>

                            <button
                              type="button"
                              disabled={saving}
                              onClick={() =>
                                togglePermissionCategory(permissions)
                              }
                              className="text-xs font-bold text-primary transition hover:text-primary-hover disabled:opacity-50"
                            >
                              {allSelected
                                ? t("users.form.clearCategory")
                                : t("users.form.selectCategory")}
                            </button>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            {permissions.map((permission) => (
                              <PermissionCheckbox
                                key={permission}
                                permission={permission}
                                checked={values.permissions.includes(
                                  permission,
                                )}
                                disabled={saving}
                                onChange={() => togglePermission(permission)}
                                label={t(
                                  `users.permissionActions.${permissionAction(
                                    permission,
                                  )}`,
                                  {
                                    defaultValue: permission,
                                  },
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:border-slate-300 disabled:opacity-50 dark:border-slate-700 dark:bg-[#071522] dark:text-slate-300"
            >
              {t("users.common.cancel")}
            </button>

            <button
              type="submit"
              disabled={saving || groupsLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <FiLoader className="animate-spin" aria-hidden="true" />
              ) : (
                <FiSave aria-hidden="true" />
              )}

              <span>
                {saving
                  ? t("users.form.saving")
                  : isEditing
                    ? t("users.form.saveChanges")
                    : t("users.form.createUser")}
              </span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
