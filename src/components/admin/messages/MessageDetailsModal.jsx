"use client";

import { useState } from "react";
import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiExternalLink,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSave,
  FiTrash2,
  FiUser,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

const MESSAGE_STATUSES = ["new", "read", "replied", "archived"];

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

function formatFileSize(value) {
  const bytes = Number(value || 0);

  if (!bytes) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function InformationItem({ icon: Icon, label, value, href }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <Icon aria-hidden="true" />

        <span>{label}</span>
      </div>

      {href && value ? (
        <a
          href={href}
          className="mt-1.5 inline-flex items-center gap-1.5 break-all text-sm font-semibold text-[#0979c4] hover:underline dark:text-sky-300"
        >
          <span>{value}</span>

          <FiExternalLink aria-hidden="true" />
        </a>
      ) : (
        <p className="mt-1.5 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
          {value || "-"}
        </p>
      )}
    </div>
  );
}

function DeliveryStatus({ icon: Icon, label, delivery }) {
  const status = delivery?.status || "pending";

  const successfulStatuses = ["delivered", "partially-delivered"];

  const failed = status === "failed";

  const skipped = status === "skipped";

  const SuccessfulIcon = successfulStatuses.includes(status)
    ? FiCheckCircle
    : failed
      ? FiXCircle
      : FiClock;

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon
            aria-hidden="true"
            className="text-[#0979c4] dark:text-sky-300"
          />

          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {label}
          </span>
        </div>

        <SuccessfulIcon
          aria-hidden="true"
          className={[
            "text-lg",
            failed
              ? "text-red-500"
              : skipped
                ? "text-slate-400"
                : successfulStatuses.includes(status)
                  ? "text-emerald-500"
                  : "text-amber-500",
          ].join(" ")}
        />
      </div>

      <p className="mt-2 text-xs font-semibold capitalize text-slate-500 dark:text-slate-400">
        {status.replaceAll("-", " ")}
      </p>

      {delivery?.error ? (
        <p className="mt-2 break-words text-xs leading-5 text-red-600 dark:text-red-400">
          {delivery.error}
        </p>
      ) : null}

      {delivery?.reason ? (
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {delivery.reason}
        </p>
      ) : null}
    </div>
  );
}

export function MessageDetailsModal({
  message,
  canUpdate,
  canDelete,
  saving,
  deleting,
  downloadingAttachment,
  onClose,
  onSave,
  onDelete,
  onDownloadAttachment,
}) {
  const { t, i18n } = useTranslation("admin");

  const [status, setStatus] = useState(message.status || "new");

  const [internalNote, setInternalNote] = useState(message.internalNote || "");

  const [assignedTo, setAssignedTo] = useState(message.assignedTo || "");

  const locale = i18n.resolvedLanguage === "th" ? "th" : "en";

  const changed =
    status !== message.status ||
    internalNote !== (message.internalNote || "") ||
    assignedTo !== (message.assignedTo || "");

  function saveMessage() {
    onSave({
      status,
      internalNote,
      assignedTo,
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6">
      <button
        type="button"
        aria-label={t("messages.actions.close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-detail-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#071522]"
      >
        <header className="flex items-start justify-between gap-5 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0979c4] dark:text-sky-400">
              {t("messages.detail.eyebrow")}
            </p>

            <h2
              id="message-detail-title"
              className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl"
            >
              {message.fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {formatDate(message.createdAt, locale)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX aria-hidden="true" className="text-xl" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-6 sm:px-7">
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-6">
              <div className="grid gap-5 rounded-2xl border border-slate-200 p-5 sm:grid-cols-2 dark:border-slate-800">
                <InformationItem
                  icon={FiUser}
                  label={t("messages.fields.fullName")}
                  value={message.fullName}
                />

                <InformationItem
                  icon={FiUser}
                  label={t("messages.fields.company")}
                  value={message.company}
                />

                <InformationItem
                  icon={FiMail}
                  label={t("messages.fields.email")}
                  value={message.email}
                  href={`mailto:${message.email}`}
                />

                <InformationItem
                  icon={FiPhone}
                  label={t("messages.fields.phone")}
                  value={message.phone}
                  href={message.phone ? `tel:${message.phone}` : undefined}
                />

                <InformationItem
                  icon={FiBell}
                  label={t("messages.fields.enquiryType")}
                  value={t(`messages.enquiryTypes.${message.enquiryType}`)}
                />

                <InformationItem
                  icon={FiBell}
                  label={t("messages.fields.productCategory")}
                  value={
                    message.productCategory
                      ? t(
                          `messages.productCategories.${message.productCategory}`,
                        )
                      : "-"
                  }
                />

                <InformationItem
                  icon={FiMapPin}
                  label={t("messages.fields.projectName")}
                  value={message.projectName}
                />

                <InformationItem
                  icon={FiMapPin}
                  label={t("messages.fields.projectLocation")}
                  value={message.projectLocation}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                  {t("messages.fields.message")}
                </h3>

                <div className="mt-2 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  {message.message}
                </div>
              </div>

              {message.attachment ? (
                <div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    {t("messages.fields.attachment")}
                  </h3>

                  <button
                    type="button"
                    onClick={onDownloadAttachment}
                    disabled={downloadingAttachment}
                    className="mt-2 flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#0979c4] disabled:cursor-wait disabled:opacity-60 dark:border-slate-700"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0979c4]/10 text-[#0979c4]">
                        {downloadingAttachment ? (
                          <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                        ) : (
                          <FiDownload aria-hidden="true" />
                        )}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {message.attachment.originalName}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatFileSize(message.attachment.size)}
                        </p>
                      </div>
                    </div>

                    <FiExternalLink
                      aria-hidden="true"
                      className="shrink-0 text-[#0979c4]"
                    />
                  </button>
                </div>
              ) : null}
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="font-bold text-slate-950 dark:text-white">
                  {t("messages.detail.management")}
                </h3>

                <div className="mt-5 space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t("messages.fields.status")}
                    </span>

                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      disabled={!canUpdate}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#0979c4] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {MESSAGE_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {t(`messages.statuses.${value}`)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t("messages.fields.assignedTo")}
                    </span>

                    <input
                      value={assignedTo}
                      onChange={(event) => setAssignedTo(event.target.value)}
                      disabled={!canUpdate}
                      maxLength={200}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#0979c4] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t("messages.fields.internalNote")}
                    </span>

                    <textarea
                      value={internalNote}
                      onChange={(event) => setInternalNote(event.target.value)}
                      disabled={!canUpdate}
                      maxLength={3000}
                      rows={6}
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0979c4] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </label>

                  {canUpdate ? (
                    <button
                      type="button"
                      onClick={saveMessage}
                      disabled={saving || !changed}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-4 text-sm font-bold !text-white transition hover:bg-[#0769aa] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiSave aria-hidden="true" />

                      <span>
                        {saving
                          ? t("messages.actions.saving")
                          : t("messages.actions.save")}
                      </span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-bold text-slate-950 dark:text-white">
                  {t("messages.detail.notifications")}
                </h3>

                <div className="space-y-3">
                  <DeliveryStatus
                    icon={FiBell}
                    label={t("messages.notifications.inApp")}
                    delivery={message.notificationDelivery?.inApp}
                  />

                  <DeliveryStatus
                    icon={FiMail}
                    label={t("messages.notifications.email")}
                    delivery={message.notificationDelivery?.email}
                  />

                  <DeliveryStatus
                    icon={FiMessageCircle}
                    label={t("messages.notifications.line")}
                    delivery={message.notificationDelivery?.line}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>

        <footer className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:px-7">
          <div>
            {canDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <FiTrash2 aria-hidden="true" />

                <span>
                  {deleting
                    ? t("messages.actions.deleting")
                    : t("messages.actions.delete")}
                </span>
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("messages.actions.close")}
          </button>
        </footer>
      </section>
    </div>
  );
}
