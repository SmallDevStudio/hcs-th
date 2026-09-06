"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiChevronDown,
  FiFilter,
  FiRefreshCw,
  FiRotateCcw,
  FiTrash2,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { TRASH_ENTITY_TYPES } from "@/constants/trash";
import { apiClient } from "@/services/http/axios";

function createQueryParameters(entityType, cursor = "") {
  const parameters = new URLSearchParams();

  parameters.set("limit", "25");

  if (entityType) {
    parameters.set("entityType", entityType);
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

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function createSweetAlertOptions({
  darkMode,
  title,
  text,
  confirmText,
  cancelText,
  danger = false,
}) {
  return {
    title,
    text,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? "#dc2626" : "#0979c4",
    cancelButtonColor: "#64748b",
    reverseButtons: true,

    background: darkMode ? "#071522" : "#ffffff",
    color: darkMode ? "#f8fafc" : "#0f172a",
  };
}

function isDarkModeActive() {
  return document.documentElement.classList.contains("dark");
}

export function TrashClient({
  initialItems,
  initialPagination,
  canRestore,
  canDeletePermanently,
}) {
  const { t, i18n } = useTranslation("admin");

  const [items, setItems] = useState(initialItems);

  const [pagination, setPagination] = useState(initialPagination);

  const [selectedEntityType, setSelectedEntityType] = useState("");

  const [appliedEntityType, setAppliedEntityType] = useState("");

  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  async function requestTrashItems({
    entityType,
    cursor = "",
    append = false,
  }) {
    setLoading(true);

    try {
      const query = createQueryParameters(entityType, cursor);

      const response = await apiClient.get(`/trash?${query}`);

      setItems((currentItems) =>
        append ? [...currentItems, ...response.data] : response.data,
      );

      setPagination(response.meta.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error, t("trash.messages.loadFailed")));
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyFilter(event) {
    event.preventDefault();

    setAppliedEntityType(selectedEntityType);

    await requestTrashItems({
      entityType: selectedEntityType,
    });
  }

  async function handleResetFilter() {
    setSelectedEntityType("");
    setAppliedEntityType("");

    await requestTrashItems({
      entityType: "",
    });
  }

  async function handleLoadMore() {
    if (loading || !pagination.nextCursor) {
      return;
    }

    await requestTrashItems({
      entityType: appliedEntityType,
      cursor: pagination.nextCursor,
      append: true,
    });
  }

  async function handleRestore(item) {
    const confirmation = await Swal.fire(
      createSweetAlertOptions({
        darkMode: isDarkModeActive(),
        title: t("trash.confirmRestore.title"),
        text: t("trash.confirmRestore.text"),
        confirmText: t("trash.confirmRestore.confirm"),
        cancelText: t("trash.confirmRestore.cancel"),
      }),
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setProcessingId(item.id);

    try {
      await apiClient.post(`/trash/${item.id}/restore`);

      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id),
      );

      toast.success(t("trash.messages.restored"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("trash.messages.restoreFailed")));
    } finally {
      setProcessingId(null);
    }
  }

  async function handlePermanentDelete(item) {
    const confirmation = await Swal.fire(
      createSweetAlertOptions({
        darkMode: isDarkModeActive(),
        title: t("trash.confirmDelete.title"),
        text: t("trash.confirmDelete.text"),
        confirmText: t("trash.confirmDelete.confirm"),
        cancelText: t("trash.confirmDelete.cancel"),
        danger: true,
      }),
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setProcessingId(item.id);

    try {
      await apiClient.delete(`/trash/${item.id}`);

      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id),
      );

      toast.success(t("trash.messages.deleted"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("trash.messages.deleteFailed")));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
          {t("trash.eyebrow")}
        </p>

        <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
          {t("trash.title")}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {t("trash.description")}
        </p>
      </header>

      <form
        onSubmit={handleApplyFilter}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522]"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="block w-full sm:max-w-xs">
            <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
              {t("trash.filters.entityType")}
            </span>

            <select
              value={selectedEntityType}
              onChange={(event) => setSelectedEntityType(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="">{t("trash.filters.allEntities")}</option>

              {TRASH_ENTITY_TYPES.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {t(`trash.entities.${entityType}`, {
                    defaultValue: entityType,
                  })}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:opacity-50"
            >
              <FiFilter aria-hidden="true" />
              {t("trash.filters.apply")}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleResetFilter}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FiRefreshCw aria-hidden="true" />
              {t("trash.filters.reset")}
            </button>
          </div>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {[
                  "item",
                  "type",
                  "deletedBy",
                  "deletedAt",
                  "expiresAt",
                  "actions",
                ].map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    {t(`trash.table.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {items.map((item) => {
                const processing = processingId === item.id;

                return (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-900/60"
                  >
                    <td className="px-4 py-4">
                      <p className="max-w-64 truncate text-sm font-bold text-slate-900 dark:text-white">
                        {item.displayName || t("trash.table.unnamed")}
                      </p>

                      <p className="mt-1 max-w-64 truncate font-mono text-xs text-slate-400">
                        {item.entityId}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {t(`trash.entities.${item.entityType}`, {
                          defaultValue: item.entityType,
                        })}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <p className="max-w-48 truncate text-sm text-slate-700 dark:text-slate-300">
                        {item.deletedBy?.displayName ||
                          item.deletedBy?.email ||
                          t("trash.table.unknownUser")}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {formatDate(item.deletedAt, i18n.resolvedLanguage)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {formatDate(item.expiresAt, i18n.resolvedLanguage)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {canRestore ? (
                          <button
                            type="button"
                            disabled={processing}
                            onClick={() => handleRestore(item)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            <FiRotateCcw aria-hidden="true" />

                            {processing
                              ? t("trash.actions.restoring")
                              : t("trash.actions.restore")}
                          </button>
                        ) : null}

                        {canDeletePermanently ? (
                          <button
                            type="button"
                            disabled={processing}
                            onClick={() => handlePermanentDelete(item)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-300"
                          >
                            <FiTrash2 aria-hidden="true" />

                            {processing
                              ? t("trash.actions.deleting")
                              : t("trash.actions.deletePermanently")}
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

        {!items.length ? (
          <div className="px-5 py-16 text-center">
            <FiTrash2 className="mx-auto text-3xl text-slate-300 dark:text-slate-600" />

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {appliedEntityType
                ? t("trash.messages.filteredEmpty")
                : t("trash.messages.empty")}
            </p>
          </div>
        ) : null}

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("trash.pagination.showing", {
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
                ? t("trash.actions.loading")
                : t("trash.actions.loadMore")}
            </button>
          ) : (
            <p className="text-xs text-slate-400">
              {t("trash.pagination.end")}
            </p>
          )}
        </footer>
      </section>
    </div>
  );
}
