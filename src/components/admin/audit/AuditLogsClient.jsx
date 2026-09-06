"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiActivity,
  FiChevronDown,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { toast } from "sonner";

import {
  AUDIT_ACTION_VALUES,
  AUDIT_ENTITY_TYPE_VALUES,
} from "@/constants/audit";
import { apiClient } from "@/services/http/axios";

const EMPTY_FILTERS = {
  action: "",
  entityType: "",
  actorUid: "",
  dateFrom: "",
  dateTo: "",
};

function createQueryParameters(filters, cursor = "") {
  const parameters = new URLSearchParams();

  parameters.set("limit", "25");

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      parameters.set(key, value);
    }
  }

  if (cursor) {
    parameters.set("cursor", cursor);
  }

  return parameters.toString();
}

function formatDate(value, locale) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatJson(value) {
  if (value === undefined || value === null) {
    return "-";
  }

  if (typeof value === "string") {
    return value || "-";
  }

  return JSON.stringify(value, null, 2);
}

function ActionBadge({ action }) {
  const { t } = useTranslation("admin");

  const isAuthentication = action?.startsWith("AUTH_");
  const isDelete = action?.includes("DELETE");
  const isCreate = action?.includes("CREATE") || action?.includes("UPLOAD");
  const isRestore = action?.includes("RESTORE");

  const color = isDelete
    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
    : isCreate || isRestore
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      : isAuthentication
        ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
        : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${color}`}
    >
      {t(`auditLogs.actions.${action}`, {
        defaultValue: action,
      })}
    </span>
  );
}

function AuditDetailsDialog({ item, onClose }) {
  const { t, i18n } = useTranslation("admin");

  if (!item) {
    return null;
  }

  const changes = Object.entries(item.changes || {});

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-dialog-title"
    >
      <button
        type="button"
        aria-label={t("auditLogs.details.close")}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#071522]">
        <header className="flex items-center justify-between gap-5 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0979c4] dark:text-sky-400">
              Audit Log
            </p>

            <h2
              id="audit-dialog-title"
              className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white"
            >
              {t("auditLogs.details.title")}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("auditLogs.details.close")}
            className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX className="text-xl" aria-hidden="true" />
          </button>
        </header>

        <div className="max-h-[calc(90vh-76px)] overflow-y-auto p-5">
          <dl className="grid gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-slate-500">
                {t("auditLogs.details.action")}
              </dt>
              <dd className="mt-1">
                <ActionBadge action={item.action} />
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-slate-500">
                {t("auditLogs.details.entity")}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {t(`auditLogs.entities.${item.entityType}`, {
                  defaultValue: item.entityType,
                })}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-slate-500">
                {t("auditLogs.details.actor")}
              </dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                {item.actor?.displayName || item.actor?.email || "-"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-slate-500">
                {t("auditLogs.details.date")}
              </dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                {formatDate(item.createdAt, i18n.resolvedLanguage)}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-slate-500">
                {t("auditLogs.details.entityId")}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                {item.entityId || "-"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-slate-500">
                {t("auditLogs.details.ipAddress")}
              </dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                {item.metadata?.ipAddress || "-"}
              </dd>
            </div>
          </dl>

          {item.metadata?.userAgent ? (
            <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500">
                {t("auditLogs.details.userAgent")}
              </p>
              <p className="mt-2 break-all text-xs leading-5 text-slate-700 dark:text-slate-300">
                {item.metadata.userAgent}
              </p>
            </div>
          ) : null}

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">
              {t("auditLogs.details.changes")}
            </h3>

            {changes.length ? (
              <div className="mt-3 space-y-4">
                {changes.map(([field, change]) => (
                  <article
                    key={field}
                    className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <header className="bg-slate-50 px-4 py-3 font-mono text-xs font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {field}
                    </header>

                    <div className="grid lg:grid-cols-2">
                      <div className="border-b border-slate-200 p-4 dark:border-slate-700 lg:border-b-0 lg:border-r">
                        <p className="text-xs font-bold uppercase text-red-600 dark:text-red-400">
                          {t("auditLogs.details.before")}
                        </p>

                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-600 dark:text-slate-300">
                          {formatJson(change.before)}
                        </pre>
                      </div>

                      <div className="p-4">
                        <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          {t("auditLogs.details.after")}
                        </p>

                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-600 dark:text-slate-300">
                          {formatJson(change.after)}
                        </pre>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                {t("auditLogs.details.noChanges")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuditLogsClient({ initialItems, initialPagination }) {
  const { t, i18n } = useTranslation("admin");

  const [items, setItems] = useState(initialItems);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  async function requestLogs(nextFilters, cursor = "", append = false) {
    setLoading(true);

    try {
      const query = createQueryParameters(nextFilters, cursor);

      const response = await apiClient.get(`/audit-logs?${query}`);

      setItems((currentItems) =>
        append ? [...currentItems, ...response.data] : response.data,
      );

      setPagination(response.meta.pagination);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || t("auditLogs.messages.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  async function handleApplyFilters(event) {
    event.preventDefault();

    setAppliedFilters(filters);
    await requestLogs(filters);
  }

  async function handleResetFilters() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    await requestLogs(EMPTY_FILTERS);
  }

  async function handleLoadMore() {
    if (!pagination.nextCursor || loading) {
      return;
    }

    await requestLogs(appliedFilters, pagination.nextCursor, true);
  }

  return (
    <>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
            {t("auditLogs.eyebrow")}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            {t("auditLogs.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("auditLogs.description")}
          </p>
        </header>

        <form
          onSubmit={handleApplyFilters}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522]"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {t("auditLogs.filters.action")}
              </span>

              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">{t("auditLogs.filters.allActions")}</option>

                {AUDIT_ACTION_VALUES.map((action) => (
                  <option key={action} value={action}>
                    {t(`auditLogs.actions.${action}`, {
                      defaultValue: action,
                    })}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {t("auditLogs.filters.entityType")}
              </span>

              <select
                name="entityType"
                value={filters.entityType}
                onChange={handleFilterChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">{t("auditLogs.filters.allEntities")}</option>

                {AUDIT_ENTITY_TYPE_VALUES.map((entity) => (
                  <option key={entity} value={entity}>
                    {t(`auditLogs.entities.${entity}`, {
                      defaultValue: entity,
                    })}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {t("auditLogs.filters.actorUid")}
              </span>

              <input
                name="actorUid"
                value={filters.actorUid}
                onChange={handleFilterChange}
                placeholder={t("auditLogs.filters.actorPlaceholder")}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {t("auditLogs.filters.dateFrom")}
              </span>

              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                {t("auditLogs.filters.dateTo")}
              </span>

              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:opacity-50"
            >
              <FiFilter aria-hidden="true" />
              {t("auditLogs.filters.apply")}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleResetFilters}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FiRefreshCw aria-hidden="true" />
              {t("auditLogs.filters.reset")}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  {[
                    "date",
                    "user",
                    "action",
                    "entity",
                    "source",
                    "details",
                  ].map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      {t(`auditLogs.table.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-900/60"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {formatDate(item.createdAt, i18n.resolvedLanguage)}
                    </td>

                    <td className="px-4 py-4">
                      <p className="max-w-48 truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {item.actor?.displayName ||
                          item.actor?.email ||
                          t("auditLogs.table.unknownUser")}
                      </p>

                      <p className="max-w-48 truncate text-xs text-slate-400">
                        {item.actor?.email || item.actor?.uid}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <ActionBadge action={item.action} />
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {t(`auditLogs.entities.${item.entityType}`, {
                        defaultValue: item.entityType,
                      })}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {item.metadata?.source || t("auditLogs.table.system")}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex size-9 items-center justify-center rounded-lg text-[#0979c4] transition hover:bg-[#0979c4]/10 dark:text-sky-400"
                        aria-label={t("auditLogs.table.view")}
                      >
                        <FiEye aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!items.length ? (
            <div className="px-5 py-16 text-center">
              <FiActivity className="mx-auto text-3xl text-slate-300 dark:text-slate-600" />

              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {t("auditLogs.messages.noResults")}
              </p>
            </div>
          ) : null}

          <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("auditLogs.pagination.showing", {
                count: items.length,
              })}
            </p>

            {pagination.hasMore ? (
              <button
                type="button"
                disabled={loading}
                onClick={handleLoadMore}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-[#0979c4]/50 hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
              >
                <FiChevronDown aria-hidden="true" />

                {loading
                  ? t("auditLogs.pagination.loading")
                  : t("auditLogs.pagination.loadMore")}
              </button>
            ) : (
              <p className="text-xs text-slate-400">
                {t("auditLogs.pagination.end")}
              </p>
            )}
          </footer>
        </section>
      </div>

      <AuditDetailsDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
