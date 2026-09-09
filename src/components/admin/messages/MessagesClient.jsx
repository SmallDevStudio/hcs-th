"use client";

import { useState } from "react";
import {
  FiChevronRight,
  FiInbox,
  FiMail,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { MessageDetailsModal } from "@/components/admin/messages/MessageDetailsModal";
import {
  deleteContactMessage,
  getContactAttachmentDownload,
  getContactMessage,
  getContactMessages,
  updateContactMessage,
} from "@/services/http/contact-messages.api";

import { refreshAdminMessageBadge } from "@/components/admin/messages/AdminMessageBadge";

const STATUS_VALUES = ["", "new", "read", "replied", "archived"];

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

function StatusBadge({ status, label }) {
  const styles = {
    new: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-500/10 dark:text-blue-300",

    read: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",

    replied:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300",

    archived:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-300",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1",
        "text-[11px] font-bold",
        styles[status] || styles.read,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function normalizePagination(pagination) {
  return {
    limit: Number(pagination?.limit) || 25,

    count: Number(pagination?.count) || 0,

    hasMore: Boolean(pagination?.hasMore),

    nextCursor: pagination?.nextCursor || null,
  };
}

export function MessagesClient({
  initialItems = [],
  initialPagination,
  canUpdate,
  canDelete,
}) {
  const { t, i18n } = useTranslation("admin");

  const [items, setItems] = useState(
    Array.isArray(initialItems) ? initialItems : [],
  );

  const [pagination, setPagination] = useState(
    normalizePagination(initialPagination),
  );

  const [searchInput, setSearchInput] = useState("");

  const [activeSearch, setActiveSearch] = useState("");

  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [openingMessage, setOpeningMessage] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState(null);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [downloadingAttachment, setDownloadingAttachment] = useState(false);

  const locale = i18n.resolvedLanguage === "th" ? "th" : "en";

  async function loadMessages({
    nextStatus = status,
    nextSearch = activeSearch,
    cursor,
    append = false,
  } = {}) {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await getContactMessages({
        limit: 25,

        cursor,

        status: nextStatus || undefined,

        search: nextSearch || undefined,
      });

      setItems((currentItems) =>
        append
          ? [
              ...currentItems,

              ...result.items.filter(
                (nextItem) =>
                  !currentItems.some(
                    (currentItem) => currentItem.id === nextItem.id,
                  ),
              ),
            ]
          : result.items,
      );

      setPagination(normalizePagination(result.pagination));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || t("messages.messages.loadFailed"),
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function applyFilters(event) {
    event?.preventDefault();

    const nextSearch = searchInput.trim();

    setActiveSearch(nextSearch);

    await loadMessages({
      nextStatus: status,
      nextSearch,
      cursor: undefined,
      append: false,
    });
  }

  async function changeStatusFilter(event) {
    const nextStatus = event.target.value;

    setStatus(nextStatus);

    await loadMessages({
      nextStatus,
      nextSearch: activeSearch,
      cursor: undefined,
      append: false,
    });
  }

  async function resetFilters() {
    setSearchInput("");
    setActiveSearch("");
    setStatus("");

    await loadMessages({
      nextStatus: "",
      nextSearch: "",
      cursor: undefined,
      append: false,
    });
  }

  async function refreshMessages() {
    await loadMessages({
      nextStatus: status,
      nextSearch: activeSearch,
      cursor: undefined,
      append: false,
    });
  }

  async function loadMoreMessages() {
    if (!pagination.hasMore || !pagination.nextCursor || loadingMore) {
      return;
    }

    await loadMessages({
      nextStatus: status,
      nextSearch: activeSearch,
      cursor: pagination.nextCursor,
      append: true,
    });
  }

  async function openMessage(messageId) {
    setOpeningMessage(true);

    try {
      let message = await getContactMessage(messageId);

      if (canUpdate && message.status === "new") {
        message = await updateContactMessage({
          messageId,

          values: {
            status: "read",
          },
        });

        setItems((currentItems) =>
          currentItems.map((item) => (item.id === messageId ? message : item)),
        );

        refreshAdminMessageBadge();
      }

      setSelectedMessage(message);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          t("messages.messages.detailLoadFailed"),
      );
    } finally {
      setOpeningMessage(false);
    }
  }

  async function saveMessage(values) {
    if (!selectedMessage || !canUpdate) {
      return;
    }

    setSaving(true);

    try {
      const updatedMessage = await updateContactMessage({
        messageId: selectedMessage.id,

        values,
      });

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === updatedMessage.id ? updatedMessage : item,
        ),
      );

      setSelectedMessage(updatedMessage);

      refreshAdminMessageBadge();

      toast.success(t("messages.messages.updated"));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || t("messages.messages.updateFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function downloadAttachment() {
    if (!selectedMessage?.id || !selectedMessage.attachment) {
      return;
    }

    setDownloadingAttachment(true);

    try {
      const result = await getContactAttachmentDownload(selectedMessage.id);

      if (!result?.downloadUrl) {
        throw new Error("Invalid attachment download URL");
      }

      const downloadLink = document.createElement("a");

      downloadLink.href = result.downloadUrl;

      downloadLink.target = "_blank";

      downloadLink.rel = "noopener noreferrer";

      downloadLink.download =
        selectedMessage.attachment.originalName || "attachment";

      document.body.appendChild(downloadLink);

      downloadLink.click();

      downloadLink.remove();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("messages.messages.downloadFailed"),
      );
    } finally {
      setDownloadingAttachment(false);
    }
  }

  async function removeMessage() {
    if (!selectedMessage || !canDelete) {
      return;
    }

    const confirmation = await Swal.fire({
      icon: "warning",

      title: t("messages.confirmDelete.title"),

      text: t("messages.confirmDelete.text"),

      confirmButtonText: t("messages.confirmDelete.confirm"),

      cancelButtonText: t("messages.confirmDelete.cancel"),

      showCancelButton: true,

      reverseButtons: true,

      confirmButtonColor: "#dc2626",

      cancelButtonColor: "#64748b",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setDeleting(true);

    try {
      await deleteContactMessage(selectedMessage.id);

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== selectedMessage.id),
      );

      setSelectedMessage(null);

      refreshAdminMessageBadge();

      toast.success(t("messages.messages.deleted"));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || t("messages.messages.deleteFailed"),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0979c4] dark:text-sky-400">
            {t("messages.eyebrow")}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
            {t("messages.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("messages.description")}
          </p>
        </div>

        <button
          type="button"
          onClick={refreshMessages}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:border-[#0979c4] hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:bg-[#071522] dark:text-slate-300"
        >
          <FiRefreshCw
            aria-hidden="true"
            className={loading ? "animate-spin" : ""}
          />

          <span>{t("messages.actions.refresh")}</span>
        </button>
      </header>

      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#071522] lg:grid-cols-[220px_1fr_auto_auto]"
      >
        <select
          value={status}
          onChange={changeStatusFilter}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {STATUS_VALUES.map((value) => (
            <option key={value || "all"} value={value}>
              {value
                ? t(`messages.statuses.${value}`)
                : t("messages.filters.allStatuses")}
            </option>
          ))}
        </select>

        <label className="relative block">
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("messages.filters.searchPlaceholder")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-[#0979c4] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:opacity-50"
        >
          <FiSearch aria-hidden="true" />

          <span>{t("messages.actions.search")}</span>
        </button>

        <button
          type="button"
          onClick={resetFilters}
          disabled={loading}
          className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {t("messages.actions.reset")}
        </button>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#071522]">
        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <span
              aria-label={t("messages.messages.loading")}
              className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0979c4]"
            />
          </div>
        ) : items.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/70">
                  <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-4">{t("messages.table.sender")}</th>

                    <th className="px-5 py-4">{t("messages.table.enquiry")}</th>

                    <th className="px-5 py-4">{t("messages.table.message")}</th>

                    <th className="px-5 py-4">{t("messages.table.status")}</th>

                    <th className="px-5 py-4">
                      {t("messages.table.receivedAt")}
                    </th>

                    <th className="w-16 px-5 py-4">
                      <span className="sr-only">
                        {t("messages.table.actions")}
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((message) => (
                    <tr
                      key={message.id}
                      className={[
                        "transition hover:bg-slate-50 dark:hover:bg-slate-900/50",
                        message.status === "new"
                          ? "bg-blue-50/40 dark:bg-blue-500/[0.04]"
                          : "",
                      ].join(" ")}
                    >
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openMessage(message.id)}
                          className="text-left"
                        >
                          <p className="font-bold text-slate-950 dark:text-white">
                            {message.fullName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {message.email}
                          </p>

                          {message.company ? (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {message.company}
                            </p>
                          ) : null}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {t(`messages.enquiryTypes.${message.enquiryType}`)}
                      </td>

                      <td className="max-w-[320px] px-5 py-4">
                        <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {message.message}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={message.status}
                          label={t(`messages.statuses.${message.status}`)}
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(message.createdAt, locale)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openMessage(message.id)}
                          disabled={openingMessage}
                          aria-label={t("messages.actions.view")}
                          className="flex size-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#0979c4]/10 hover:text-[#0979c4] disabled:opacity-50"
                        >
                          <FiChevronRight aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("messages.pagination.showing", {
                  count: items.length,
                })}
              </p>

              {pagination.hasMore && pagination.nextCursor ? (
                <button
                  type="button"
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-[#0979c4] hover:text-[#0979c4] disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                >
                  {loadingMore ? (
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
                    />
                  ) : null}

                  <span>
                    {loadingMore
                      ? t("messages.actions.loadingMore")
                      : t("messages.actions.loadMore")}
                  </span>
                </button>
              ) : (
                <p className="text-xs text-slate-400">
                  {t("messages.pagination.end")}
                </p>
              )}
            </footer>
          </>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400 dark:bg-slate-800">
              {activeSearch || status ? (
                <FiSearch aria-hidden="true" />
              ) : (
                <FiInbox aria-hidden="true" />
              )}
            </span>

            <h2 className="mt-4 font-bold text-slate-950 dark:text-white">
              {activeSearch || status
                ? t("messages.empty.filteredTitle")
                : t("messages.empty.title")}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {activeSearch || status
                ? t("messages.empty.filteredDescription")
                : t("messages.empty.description")}
            </p>
          </div>
        )}
      </section>

      {openingMessage ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-xl dark:bg-slate-900 dark:text-slate-200">
            <span className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#0979c4]" />

            <span>{t("messages.messages.loading")}</span>
          </div>
        </div>
      ) : null}

      {selectedMessage ? (
        <MessageDetailsModal
          key={selectedMessage.id}
          message={selectedMessage}
          canUpdate={canUpdate}
          canDelete={canDelete}
          saving={saving}
          deleting={deleting}
          downloadingAttachment={downloadingAttachment}
          onClose={() => setSelectedMessage(null)}
          onSave={saveMessage}
          onDelete={removeMessage}
          onDownloadAttachment={downloadAttachment}
        />
      ) : null}
    </div>
  );
}
