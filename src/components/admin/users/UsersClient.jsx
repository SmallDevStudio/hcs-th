"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiEdit3,
  FiKey,
  FiLink,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { UserFormModal } from "@/components/admin/users/UserFormModal";
import { UserPasswordModal } from "@/components/admin/users/UserPasswordModal";
import { ADMIN_ROLES, USER_STATUSES } from "@/constants/admin";
import { deleteUser, getUsers } from "@/services/http/users.api";

const INITIAL_FILTERS = Object.freeze({
  search: "",
  role: "",
  status: "",
});

function getRoleClassName(role) {
  if (role === ADMIN_ROLES.SUPERADMIN) {
    return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";
  }

  if (role === ADMIN_ROLES.ADMIN) {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function getStatusClassName(status) {
  return status === USER_STATUSES.ACTIVE
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
    : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";
}

function formatDateTime(value, locale) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getUserInitial(user) {
  const value = String(user?.displayName || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return value || "U";
}

export function UsersClient({
  currentUser,
  initialItems = [],
  initialPagination,
  options,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  canManageGroups = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const [items, setItems] = useState(
    Array.isArray(initialItems) ? initialItems : [],
  );

  const [pagination, setPagination] = useState(initialPagination);

  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);

  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  const [loading, setLoading] = useState(false);

  const [processingId, setProcessingId] = useState(null);

  const [formState, setFormState] = useState(null);

  const [passwordUser, setPasswordUser] = useState(null);

  const availableRoles = Array.isArray(options?.roles) ? options.roles : [];

  const availableStatuses = Array.isArray(options?.statuses)
    ? options.statuses
    : [];

  const hasFilters = Boolean(
    appliedFilters.search || appliedFilters.role || appliedFilters.status,
  );

  function updateDraftFilter(field, value) {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function requestItems({
    filters = appliedFilters,
    cursor,
    append = false,
  } = {}) {
    setLoading(true);

    try {
      const result = await getUsers({
        limit: 25,
        cursor,
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
      });

      setItems((current) =>
        append ? [...current, ...result.items] : result.items,
      );

      setPagination(result.pagination);
    } catch (error) {
      toast.error(error?.message || t("users.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  function handleApplyFilters(event) {
    event.preventDefault();

    const nextFilters = {
      ...draftFilters,
      search: draftFilters.search.trim(),
    };

    setAppliedFilters(nextFilters);

    void requestItems({
      filters: nextFilters,
    });
  }

  function handleResetFilters() {
    setDraftFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);

    void requestItems({
      filters: INITIAL_FILTERS,
    });
  }

  function handleRefresh() {
    void requestItems({
      filters: appliedFilters,
    });
  }

  function handleLoadMore() {
    if (!pagination?.hasMore || !pagination?.nextCursor) {
      return;
    }

    void requestItems({
      filters: appliedFilters,
      cursor: pagination.nextCursor,
      append: true,
    });
  }

  function handleSaved(savedUser) {
    setItems((current) => {
      const exists = current.some((user) => user.uid === savedUser.uid);

      if (exists) {
        return current.map((user) =>
          user.uid === savedUser.uid ? savedUser : user,
        );
      }

      return [savedUser, ...current];
    });

    setFormState(null);
  }

  function handlePasswordSaved(savedUser) {
    setItems((current) =>
      current.map((user) => (user.uid === savedUser.uid ? savedUser : user)),
    );

    setPasswordUser(null);
  }

  function canModifyUser(user) {
    if (!canUpdate || !user?.uid) {
      return false;
    }

    return user.uid !== currentUser?.uid;
  }

  function canDeleteUser(user) {
    if (!canDelete || !user?.uid) {
      return false;
    }

    return user.uid !== currentUser?.uid;
  }

  async function handleDelete(user) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: t("users.delete.title"),
      html: `
        <p>${t("users.delete.text", {
          name: user.displayName || user.email,
        })}</p>
        <p style="margin-top: 12px; color: #dc2626; font-weight: 700;">
          ${t("users.delete.permanentWarning")}
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: t("users.delete.confirm"),
      cancelButtonText: t("users.common.cancel"),
      confirmButtonColor: "#dc2626",
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    const typedConfirmation = await Swal.fire({
      icon: "error",
      title: t("users.delete.confirmationTitle"),
      input: "text",
      inputLabel: t("users.delete.confirmationLabel"),
      inputPlaceholder: "DELETE",
      showCancelButton: true,
      confirmButtonText: t("users.delete.confirm"),
      cancelButtonText: t("users.common.cancel"),
      confirmButtonColor: "#dc2626",
      focusCancel: true,
      preConfirm(value) {
        if (
          String(value || "")
            .trim()
            .toUpperCase() !== "DELETE"
        ) {
          Swal.showValidationMessage(t("users.delete.confirmationInvalid"));

          return false;
        }

        return true;
      },
    });

    if (!typedConfirmation.isConfirmed) {
      return;
    }

    setProcessingId(user.uid);

    try {
      await deleteUser(user.uid);

      setItems((current) =>
        current.filter((currentUserItem) => currentUserItem.uid !== user.uid),
      );

      toast.success(t("users.messages.deleteSuccess"));
    } catch (error) {
      toast.error(error?.message || t("users.messages.deleteFailed"));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            {t("users.eyebrow")}
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {t("users.title")}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("users.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageGroups ? (
            <Link
              href="/admin/user-groups"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-[#071522] dark:text-slate-200"
            >
              <FiShield aria-hidden="true" />

              <span>{t("users.actions.manageGroups")}</span>
            </Link>
          ) : null}

          {canCreate ? (
            <button
              type="button"
              onClick={() =>
                setFormState({
                  mode: "create",
                  user: null,
                })
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover"
            >
              <FiPlus aria-hidden="true" />

              <span>{t("users.actions.create")}</span>
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
        <form
          onSubmit={handleApplyFilters}
          className="grid gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:grid-cols-[minmax(260px,1fr)_190px_190px_auto]"
        >
          <label className="relative block">
            <span className="sr-only">{t("users.filters.search")}</span>

            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={draftFilters.search}
              onChange={(event) =>
                updateDraftFilter("search", event.target.value)
              }
              placeholder={t("users.filters.searchPlaceholder")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <select
            value={draftFilters.role}
            onChange={(event) => updateDraftFilter("role", event.target.value)}
            aria-label={t("users.filters.role")}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">{t("users.filters.allRoles")}</option>

            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {t(`users.roles.${role}`)}
              </option>
            ))}
          </select>

          <select
            value={draftFilters.status}
            onChange={(event) =>
              updateDraftFilter("status", event.target.value)
            }
            aria-label={t("users.filters.status")}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">{t("users.filters.allStatuses")}</option>

            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {t(`users.statuses.${status}`)}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? (
                <FiLoader className="animate-spin" aria-hidden="true" />
              ) : (
                <FiSearch aria-hidden="true" />
              )}

              <span>{t("users.actions.search")}</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              aria-label={t("users.actions.refresh")}
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
            >
              <FiRefreshCw
                aria-hidden="true"
                className={loading ? "animate-spin" : ""}
              />
            </button>

            {hasFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={loading}
                aria-label={t("users.actions.clear")}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
              >
                <FiX aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        {items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("users.table.user")}
                  </th>

                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("users.table.role")}
                  </th>

                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("users.table.groups")}
                  </th>

                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("users.table.line")}
                  </th>

                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("users.table.status")}
                  </th>

                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("users.table.lastLogin")}
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("users.table.actions")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((user) => {
                  const isSelf = user.uid === currentUser?.uid;

                  const processing = processingId === user.uid;

                  return (
                    <tr
                      key={user.uid}
                      className="border-b border-slate-100 last:border-b-0 dark:border-slate-800/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">
                            {getUserInitial(user)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-extrabold text-slate-950 dark:text-white">
                                {user.displayName || t("users.table.noName")}
                              </p>

                              {isSelf ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-primary">
                                  {t("users.table.you")}
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getRoleClassName(
                            user.role,
                          )}`}
                        >
                          {t(`users.roles.${user.role}`)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {Array.isArray(user.groups) && user.groups.length ? (
                          <div className="flex max-w-[240px] flex-wrap gap-1.5">
                            {user.groups.slice(0, 2).map((group) => (
                              <span
                                key={group.id}
                                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {group.name}
                              </span>
                            ))}

                            {user.groups.length > 2 ? (
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800">
                                +{user.groups.length - 2}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {t("users.table.noGroups")}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {user.lineConnection?.status === "connected" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <FiLink aria-hidden="true" />

                            {t("users.line.connected")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <FiUser aria-hidden="true" />

                            {t("users.line.disconnected")}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClassName(
                            user.status,
                          )}`}
                        >
                          {t(`users.statuses.${user.status}`)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(user.lastLoginAt, locale)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isSelf ? (
                            <Link
                              href="/admin/account"
                              aria-label={t("users.actions.myAccount")}
                              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
                            >
                              <FiUser aria-hidden="true" />
                            </Link>
                          ) : null}

                          {canModifyUser(user) ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormState({
                                    mode: "edit",
                                    user,
                                  })
                                }
                                aria-label={t("users.actions.edit")}
                                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
                              >
                                <FiEdit3 aria-hidden="true" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setPasswordUser(user)}
                                aria-label={t("users.actions.setPassword")}
                                className="flex size-9 items-center justify-center rounded-lg border border-amber-200 text-amber-600 transition hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950/30"
                              >
                                <FiKey aria-hidden="true" />
                              </button>
                            </>
                          ) : null}

                          {canDeleteUser(user) ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              disabled={processing}
                              aria-label={t("users.actions.delete")}
                              className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:hover:bg-red-950/30"
                            >
                              {processing ? (
                                <FiLoader
                                  className="animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <FiTrash2 aria-hidden="true" />
                              )}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-16 text-center">
            <FiUsers
              className="mx-auto text-5xl text-slate-300 dark:text-slate-700"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
              {t("users.empty.title")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {hasFilters
                ? t("users.empty.filteredDescription")
                : t("users.empty.description")}
            </p>
          </div>
        )}
      </section>

      {pagination?.hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-50 dark:border-slate-700 dark:bg-[#071522] dark:text-slate-300"
          >
            {loading ? (
              <FiLoader className="animate-spin" aria-hidden="true" />
            ) : null}

            {t("users.actions.loadMore")}
          </button>
        </div>
      ) : null}

      {formState ? (
        <UserFormModal
          key={formState.user?.uid || "new-user"}
          mode={formState.mode}
          user={formState.user}
          currentUser={currentUser}
          availableRoles={availableRoles}
          availableStatuses={availableStatuses}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      ) : null}

      {passwordUser ? (
        <UserPasswordModal
          key={passwordUser.uid}
          user={passwordUser}
          onClose={() => setPasswordUser(null)}
          onSaved={handlePasswordSaved}
        />
      ) : null}
    </div>
  );
}
