"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiEdit3,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { UserGroupFormModal } from "@/components/admin/user-groups/UserGroupFormModal";
import {
  deleteUserGroup,
  getUserGroups,
} from "@/services/http/user-groups.api";

const INITIAL_FILTERS = Object.freeze({
  search: "",
  status: "",
});

function statusClassName(status) {
  return status === "active"
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

export function UserGroupsClient({
  currentUser,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}) {
  const { t, i18n } = useTranslation("admin");

  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const [items, setItems] = useState([]);

  const [pagination, setPagination] = useState(null);

  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);

  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState(null);

  const [formState, setFormState] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialGroups() {
      try {
        const result = await getUserGroups({
          limit: 100,
          signal: controller.signal,
        });

        setItems(result.items);
        setPagination(result.pagination);
      } catch (error) {
        if (error?.name === "CanceledError" || error?.name === "AbortError") {
          return;
        }

        toast.error(error?.message || t("userGroups.messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadInitialGroups();

    return () => {
      controller.abort();
    };
  }, [t]);

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
      const result = await getUserGroups({
        limit: 100,
        cursor,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });

      setItems((current) =>
        append ? [...current, ...result.items] : result.items,
      );

      setPagination(result.pagination);
    } catch (error) {
      toast.error(error?.message || t("userGroups.messages.loadFailed"));
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

  function handleSaved(savedGroup) {
    setItems((current) => {
      const exists = current.some((group) => group.id === savedGroup.id);

      if (exists) {
        return current.map((group) =>
          group.id === savedGroup.id ? savedGroup : group,
        );
      }

      return [savedGroup, ...current];
    });

    setFormState(null);
  }

  async function handleDelete(group) {
    if (Number(group.memberCount || 0) > 0) {
      await Swal.fire({
        icon: "error",
        title: t("userGroups.delete.inUseTitle"),
        text: t("userGroups.delete.inUseText", {
          count: Number(group.memberCount || 0),
        }),
        confirmButtonText: t("userGroups.common.close"),
        confirmButtonColor: "#0979c4",
      });

      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",
      title: t("userGroups.delete.title"),
      text: t("userGroups.delete.text", {
        name: group.name,
      }),
      showCancelButton: true,
      confirmButtonText: t("userGroups.delete.confirm"),
      cancelButtonText: t("userGroups.common.cancel"),
      confirmButtonColor: "#dc2626",
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setProcessingId(group.id);

    try {
      await deleteUserGroup(group.id);

      setItems((current) =>
        current.filter((currentGroup) => currentGroup.id !== group.id),
      );

      toast.success(t("userGroups.messages.deleteSuccess"));
    } catch (error) {
      toast.error(error?.message || t("userGroups.messages.deleteFailed"));
    } finally {
      setProcessingId(null);
    }
  }

  const hasFilters = Boolean(appliedFilters.search || appliedFilters.status);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            {t("userGroups.eyebrow")}
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {t("userGroups.title")}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("userGroups.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/users"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-[#071522] dark:text-slate-200"
          >
            <FiUsers aria-hidden="true" />

            <span>{t("userGroups.actions.viewUsers")}</span>
          </Link>

          {canCreate ? (
            <button
              type="button"
              onClick={() =>
                setFormState({
                  mode: "create",
                  group: null,
                })
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover"
            >
              <FiPlus aria-hidden="true" />

              <span>{t("userGroups.actions.create")}</span>
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
        <form
          onSubmit={handleApplyFilters}
          className="grid gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:grid-cols-[minmax(260px,1fr)_200px_auto]"
        >
          <label className="relative block">
            <span className="sr-only">{t("userGroups.filters.search")}</span>

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
              placeholder={t("userGroups.filters.searchPlaceholder")}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <select
            value={draftFilters.status}
            onChange={(event) =>
              updateDraftFilter("status", event.target.value)
            }
            aria-label={t("userGroups.filters.status")}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">{t("userGroups.filters.allStatuses")}</option>

            <option value="active">{t("userGroups.statuses.active")}</option>

            <option value="inactive">
              {t("userGroups.statuses.inactive")}
            </option>
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

              <span>{t("userGroups.actions.search")}</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              aria-label={t("userGroups.actions.refresh")}
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
                aria-label={t("userGroups.actions.clear")}
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
              >
                <FiX aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        {loading && !items.length ? (
          <div className="flex min-h-72 items-center justify-center gap-3 text-sm font-semibold text-slate-500">
            <FiLoader
              className="animate-spin text-xl text-primary"
              aria-hidden="true"
            />

            <span>{t("userGroups.loading")}</span>
          </div>
        ) : items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("userGroups.table.group")}
                  </th>

                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("userGroups.table.permissions")}
                  </th>

                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("userGroups.table.members")}
                  </th>

                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("userGroups.table.status")}
                  </th>

                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("userGroups.table.updatedAt")}
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    {t("userGroups.table.actions")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((group) => {
                  const processing = processingId === group.id;

                  return (
                    <tr
                      key={group.id}
                      className="border-b border-slate-100 last:border-b-0 dark:border-slate-800/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FiShield aria-hidden="true" />
                          </div>

                          <div>
                            <p className="text-sm font-extrabold text-slate-950 dark:text-white">
                              {group.name}
                            </p>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {group.description ||
                                t("userGroups.table.noDescription")}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {t("userGroups.table.permissionCount", {
                            count: Array.isArray(group.permissions)
                              ? group.permissions.length
                              : 0,
                          })}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
                          <FiUsers aria-hidden="true" />

                          {Number(group.memberCount || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClassName(
                            group.status,
                          )}`}
                        >
                          {t(`userGroups.statuses.${group.status}`)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(group.updatedAt, locale)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canUpdate ? (
                            <button
                              type="button"
                              onClick={() =>
                                setFormState({
                                  mode: "edit",
                                  group,
                                })
                              }
                              aria-label={t("userGroups.actions.edit")}
                              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
                            >
                              <FiEdit3 aria-hidden="true" />
                            </button>
                          ) : null}

                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(group)}
                              disabled={
                                processing || Number(group.memberCount || 0) > 0
                              }
                              aria-label={t("userGroups.actions.delete")}
                              className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-red-900 dark:hover:bg-red-950/30"
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
            <FiShield
              className="mx-auto text-4xl text-slate-300"
              aria-hidden="true"
            />

            <h2 className="mt-4 text-base font-extrabold text-slate-950 dark:text-white">
              {t("userGroups.empty.title")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {hasFilters
                ? t("userGroups.empty.filteredDescription")
                : t("userGroups.empty.description")}
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

            {t("userGroups.actions.loadMore")}
          </button>
        </div>
      ) : null}

      {formState ? (
        <UserGroupFormModal
          key={formState.group?.id || "new-user-group"}
          mode={formState.mode}
          group={formState.group}
          currentUser={currentUser}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
