"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiLoader, FiSave, FiShield, FiX } from "react-icons/fi";
import { toast } from "sonner";

import {
  ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_VALUES,
  ADMIN_ROLES,
} from "@/constants/admin";
import {
  createUserGroup,
  updateUserGroup,
} from "@/services/http/user-groups.api";

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

function createInitialValues(group) {
  return {
    name: group?.name || "",

    description: group?.description || "",

    status: group?.status || "active",

    permissions: normalizeStringArray(group?.permissions),
  };
}

export function UserGroupFormModal({
  mode = "create",
  group = null,
  currentUser,
  onClose,
  onSaved,
}) {
  const { t } = useTranslation("admin");

  const isEditing = mode === "edit" && Boolean(group?.id);

  const [values, setValues] = useState(() => createInitialValues(group));

  const [saving, setSaving] = useState(false);

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

  function updateValue(field, value) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function togglePermission(permission) {
    setValues((current) => {
      const selectedPermissions = new Set(current.permissions);

      if (selectedPermissions.has(permission)) {
        selectedPermissions.delete(permission);
      } else {
        selectedPermissions.add(permission);
      }

      return {
        ...current,
        permissions: [...selectedPermissions],
      };
    });
  }

  function togglePermissionCategory(permissions) {
    setValues((current) => {
      const selectedPermissions = new Set(current.permissions);

      const allSelected = permissions.every((permission) =>
        selectedPermissions.has(permission),
      );

      for (const permission of permissions) {
        if (allSelected) {
          selectedPermissions.delete(permission);
        } else {
          selectedPermissions.add(permission);
        }
      }

      return {
        ...current,
        permissions: [...selectedPermissions],
      };
    });
  }

  function validateValues() {
    if (!values.name.trim()) {
      toast.error(t("userGroups.validation.nameRequired"));

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

    const payload = {
      name: values.name.trim(),

      description: values.description.trim(),

      status: values.status,

      permissions: normalizeStringArray(values.permissions),
    };

    try {
      const savedGroup = isEditing
        ? await updateUserGroup({
            groupId: group.id,
            values: payload,
          })
        : await createUserGroup({
            values: payload,
          });

      toast.success(
        isEditing
          ? t("userGroups.messages.updateSuccess")
          : t("userGroups.messages.createSuccess"),
      );

      onSaved(savedGroup);
    } catch (error) {
      toast.error(
        error?.message ||
          (isEditing
            ? t("userGroups.messages.updateFailed")
            : t("userGroups.messages.createFailed")),
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
        aria-labelledby="user-group-form-title"
        className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-[#071522]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {isEditing
                ? t("userGroups.form.editEyebrow")
                : t("userGroups.form.createEyebrow")}
            </p>

            <h2
              id="user-group-form-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white"
            >
              {isEditing
                ? t("userGroups.form.editTitle")
                : t("userGroups.form.createTitle")}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isEditing
                ? t("userGroups.form.editDescription")
                : t("userGroups.form.createDescription")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t("userGroups.common.close")}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50 dark:border-slate-700"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <section className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FiShield aria-hidden="true" />
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                        {t("userGroups.form.groupInformation")}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("userGroups.form.groupInformationDescription")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t("userGroups.form.name")}
                        <span className="ml-1 text-red-500">*</span>
                      </span>

                      <input
                        type="text"
                        value={values.name}
                        disabled={saving}
                        maxLength={100}
                        onChange={(event) =>
                          updateValue("name", event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t("userGroups.form.description")}
                      </span>

                      <textarea
                        value={values.description}
                        disabled={saving}
                        rows={5}
                        maxLength={500}
                        onChange={(event) =>
                          updateValue("description", event.target.value)
                        }
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                        {t("userGroups.form.status")}
                      </span>

                      <select
                        value={values.status}
                        disabled={saving}
                        onChange={(event) =>
                          updateValue("status", event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      >
                        <option value="active">
                          {t("userGroups.statuses.active")}
                        </option>

                        <option value="inactive">
                          {t("userGroups.statuses.inactive")}
                        </option>
                      </select>
                    </label>
                  </div>
                </div>

                {isEditing ? (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                      {t("userGroups.form.members")}
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-blue-950 dark:text-blue-100">
                      {Number(group.memberCount || 0).toLocaleString()}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
                      {t("userGroups.form.membersDescription")}
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-5">
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    {t("userGroups.form.permissions")}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {t("userGroups.form.permissionsDescription")}
                  </p>
                </div>

                <div className="space-y-6">
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
                              ? t("userGroups.form.clearCategory")
                              : t("userGroups.form.selectCategory")}
                          </button>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {permissions.map((permission) => {
                            const checked =
                              values.permissions.includes(permission);

                            return (
                              <label
                                key={permission}
                                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                                  checked
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={saving}
                                  onChange={() => togglePermission(permission)}
                                  className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />

                                <span className="min-w-0 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                  {t(
                                    `users.permissionActions.${permissionAction(
                                      permission,
                                    )}`,
                                    {
                                      defaultValue: permission,
                                    },
                                  )}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
              {t("userGroups.common.cancel")}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <FiLoader className="animate-spin" aria-hidden="true" />
              ) : (
                <FiSave aria-hidden="true" />
              )}

              <span>
                {saving
                  ? t("userGroups.form.saving")
                  : isEditing
                    ? t("userGroups.form.saveChanges")
                    : t("userGroups.form.createGroup")}
              </span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
