"use client";

import { useEffect, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiMail,
  FiMessageCircle,
  FiRefreshCw,
  FiSend,
  FiUser,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AdminCheckboxField } from "@/components/admin/form/AdminCheckboxField";
import { AdminFormField } from "@/components/admin/form/AdminFormField";
import { AdminSettingsSection } from "@/components/admin/form/AdminSettingsSection";
import { apiClient } from "@/services/http/axios";

function getFirstRecipient(value) {
  if (Array.isArray(value)) {
    return String(value[0] || "").trim();
  }

  return (
    String(value || "")
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .find(Boolean) || ""
  );
}

function normalizeSelectedUserIds(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values.map((value) => String(value || "").trim()).filter(Boolean),
    ),
  ];
}

function SecretStatus({ configured, configuredLabel, missingLabel }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        "text-xs font-semibold",

        configured
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
      ].join(" ")}
    >
      <FiCheckCircle aria-hidden="true" />

      <span>{configured ? configuredLabel : missingLabel}</span>
    </div>
  );
}

function RecipientAvatar({ recipient }) {
  const displayName =
    recipient.displayName ||
    recipient.email ||
    recipient.lineConnection?.displayName ||
    "U";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
      {initials || <FiUser aria-hidden="true" />}
    </span>
  );
}

function LineRecipientSelector({
  control,
  recipients,
  loading,
  loadError,
  onReload,
}) {
  const { t } = useTranslation("admin");

  return (
    <Controller
      control={control}
      name="notifications.line.recipientUserIds"
      render={({ field, fieldState }) => {
        const selectedUserIds = normalizeSelectedUserIds(field.value);

        function toggleRecipient(userId) {
          const selected = selectedUserIds.includes(userId);

          const nextUserIds = selected
            ? selectedUserIds.filter(
                (currentUserId) => currentUserId !== userId,
              )
            : [...selectedUserIds, userId];

          field.onChange(nextUserIds);

          field.onBlur();
        }

        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white">
                  {t("siteSettings.notifications.fields.lineRecipients")}
                </label>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {t("siteSettings.notifications.hints.lineRecipients")}
                </p>
              </div>

              <button
                type="button"
                onClick={onReload}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[#0979c4] hover:text-[#0979c4] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
              >
                <FiRefreshCw
                  aria-hidden="true"
                  className={loading ? "animate-spin" : ""}
                />

                <span>
                  {t("siteSettings.notifications.actions.reloadUsers")}
                </span>
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40">
                <span
                  aria-hidden="true"
                  className="size-6 animate-spin rounded-full border-2 border-[#0979c4]/25 border-t-[#0979c4]"
                />
              </div>
            ) : null}

            {!loading && loadError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {loadError}
              </div>
            ) : null}

            {!loading && !loadError && !recipients.length ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
                <FiMessageCircle
                  aria-hidden="true"
                  className="mx-auto text-3xl text-slate-300 dark:text-slate-600"
                />

                <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                  {t("siteSettings.notifications.line.noConnectedUsers")}
                </p>

                <p className="mx-auto mt-1 max-w-lg text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {t(
                    "siteSettings.notifications.line.noConnectedUsersDescription",
                  )}
                </p>
              </div>
            ) : null}

            {!loading && !loadError && recipients.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recipients.map((recipient) => {
                  const selected = selectedUserIds.includes(recipient.id);

                  return (
                    <button
                      key={recipient.id}
                      type="button"
                      role="checkbox"
                      aria-checked={selected}
                      onClick={() => toggleRecipient(recipient.id)}
                      className={[
                        "relative flex min-h-[82px] items-center gap-3 rounded-xl border p-3 text-left transition",

                        selected
                          ? "border-emerald-500 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-500/20 dark:bg-emerald-500/10"
                          : "border-slate-200 bg-white hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900/40",
                      ].join(" ")}
                    >
                      <RecipientAvatar recipient={recipient} />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                          {recipient.displayName || recipient.email}
                        </span>

                        <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                          {recipient.email}
                        </span>

                        <span className="mt-1 block truncate text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          LINE:{" "}
                          {recipient.lineConnection?.displayName ||
                            t("siteSettings.notifications.line.connected")}
                        </span>
                      </span>

                      <span
                        className={[
                          "absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border transition",

                          selected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-800",
                        ].join(" ")}
                      >
                        <FiCheck aria-hidden="true" />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {fieldState.error?.message ? (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}

export function NotificationSettingsTab({ control, hasUnsavedChanges }) {
  const { t } = useTranslation("admin");

  const [testingEmail, setTestingEmail] = useState(false);

  const [testingLine, setTestingLine] = useState(false);

  const [lineRecipients, setLineRecipients] = useState([]);

  const [loadingLineRecipients, setLoadingLineRecipients] = useState(true);

  const [lineRecipientsError, setLineRecipientsError] = useState("");

  const [recipientReloadKey, setRecipientReloadKey] = useState(0);

  const emailEnabled = Boolean(
    useWatch({
      control,

      name: "notifications.channels.email",
    }),
  );

  const lineEnabled = Boolean(
    useWatch({
      control,

      name: "notifications.channels.line",
    }),
  );

  const passwordConfigured = Boolean(
    useWatch({
      control,

      name: "notifications.email.passwordConfigured",
    }),
  );

  const tokenConfigured = Boolean(
    useWatch({
      control,

      name: "notifications.line.tokenConfigured",
    }),
  );

  const loginSecretConfigured = Boolean(
    useWatch({
      control,

      name: "notifications.line.loginSecretConfigured",
    }),
  );

  const selectedLineRecipients = normalizeSelectedUserIds(
    useWatch({
      control,

      name: "notifications.line.recipientUserIds",
    }),
  );

  const emailRecipients =
    useWatch({
      control,

      name: "notifications.email.recipients",
    }) || "";

  useEffect(() => {
    const abortController = new AbortController();

    async function loadRecipients() {
      setLoadingLineRecipients(true);

      setLineRecipientsError("");

      try {
        const response = await apiClient.get("/users/line-recipients", {
          signal: abortController.signal,
        });

        if (abortController.signal.aborted) {
          return;
        }

        setLineRecipients(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (
          abortController.signal.aborted ||
          error?.code === "ERR_CANCELED" ||
          error?.originalError?.code === "ERR_CANCELED"
        ) {
          return;
        }

        setLineRecipients([]);

        setLineRecipientsError(
          error?.response?.data?.message ||
            t("siteSettings.notifications.messages.lineRecipientsLoadFailed"),
        );
      } finally {
        if (!abortController.signal.aborted) {
          setLoadingLineRecipients(false);
        }
      }
    }

    void loadRecipients();

    return () => {
      abortController.abort();
    };
  }, [recipientReloadKey, t]);

  async function testEmail() {
    if (hasUnsavedChanges) {
      toast.error(t("siteSettings.notifications.messages.saveBeforeTest"));

      return;
    }

    const recipient = getFirstRecipient(emailRecipients);

    if (!recipient) {
      toast.error(t("siteSettings.notifications.messages.recipientRequired"));

      return;
    }

    setTestingEmail(true);

    try {
      await apiClient.post("/site-settings/test-email", {
        recipient,
      });

      toast.success(
        t("siteSettings.notifications.messages.emailTestSent", {
          email: recipient,
        }),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          t("siteSettings.notifications.messages.emailTestFailed"),
      );
    } finally {
      setTestingEmail(false);
    }
  }

  async function testLine() {
    if (hasUnsavedChanges) {
      toast.error(t("siteSettings.notifications.messages.saveBeforeTest"));

      return;
    }

    if (!selectedLineRecipients.length) {
      toast.error(
        t("siteSettings.notifications.messages.lineRecipientRequired"),
      );

      return;
    }

    setTestingLine(true);

    try {
      const response = await apiClient.post("/site-settings/test-line");

      toast.success(
        t("siteSettings.notifications.messages.lineTestSent", {
          count: response.data?.sentCount || 0,
        }),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          t("siteSettings.notifications.messages.lineTestFailed"),
      );
    } finally {
      setTestingLine(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminSettingsSection
        title={t("siteSettings.notifications.channels.title")}
        description={t("siteSettings.notifications.channels.description")}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <AdminCheckboxField
            control={control}
            name="notifications.channels.inApp"
            label={t("siteSettings.notifications.channels.inApp")}
            description={t(
              "siteSettings.notifications.channels.inAppDescription",
            )}
          />

          <AdminCheckboxField
            control={control}
            name="notifications.channels.email"
            label={t("siteSettings.notifications.channels.email")}
            description={t(
              "siteSettings.notifications.channels.emailDescription",
            )}
          />

          <AdminCheckboxField
            control={control}
            name="notifications.channels.line"
            label={t("siteSettings.notifications.channels.line")}
            description={t(
              "siteSettings.notifications.channels.lineDescription",
            )}
          />
        </div>
      </AdminSettingsSection>

      <AdminSettingsSection
        title={t("siteSettings.notifications.email.title")}
        description={t("siteSettings.notifications.email.description")}
      >
        <div
          className={[
            "space-y-6 transition-opacity",

            emailEnabled ? "opacity-100" : "opacity-70",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#0979c4]/10 text-xl text-[#0979c4] dark:bg-[#0979c4]/20 dark:text-sky-300">
                <FiMail aria-hidden="true" />
              </span>

              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  {t("siteSettings.notifications.email.smtpTitle")}
                </h3>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t("siteSettings.notifications.email.smtpDescription")}
                </p>
              </div>
            </div>

            <SecretStatus
              configured={passwordConfigured}
              configuredLabel={t(
                "siteSettings.notifications.status.passwordConfigured",
              )}
              missingLabel={t(
                "siteSettings.notifications.status.passwordMissing",
              )}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AdminFormField
              control={control}
              name="notifications.email.smtpHost"
              label={t("siteSettings.notifications.fields.smtpHost")}
              placeholder="smtp.example.com"
            />

            <AdminFormField
              control={control}
              name="notifications.email.smtpPort"
              label={t("siteSettings.notifications.fields.smtpPort")}
              placeholder="587"
              type="number"
              inputMode="numeric"
            />

            <AdminCheckboxField
              control={control}
              name="notifications.email.smtpSecure"
              label={t("siteSettings.notifications.fields.smtpSecure")}
              description={t(
                "siteSettings.notifications.fields.smtpSecureDescription",
              )}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <AdminFormField
              control={control}
              name="notifications.email.smtpUsername"
              label={t("siteSettings.notifications.fields.smtpUsername")}
              placeholder="notifications@example.com"
              autoComplete="off"
            />

            <AdminFormField
              control={control}
              name="notifications.email.smtpPassword"
              label={t("siteSettings.notifications.fields.smtpPassword")}
              placeholder={
                passwordConfigured
                  ? t(
                      "siteSettings.notifications.placeholders.secretConfigured",
                    )
                  : t("siteSettings.notifications.placeholders.smtpPassword")
              }
              hint={t("siteSettings.notifications.hints.secret")}
              type="password"
              autoComplete="new-password"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <AdminFormField
              control={control}
              name="notifications.email.fromName"
              label={t("siteSettings.notifications.fields.fromName")}
              placeholder="HCS Thailand Website"
            />

            <AdminFormField
              control={control}
              name="notifications.email.fromEmail"
              label={t("siteSettings.notifications.fields.fromEmail")}
              placeholder="notifications@hcsthailand.com"
              type="email"
            />
          </div>

          <AdminFormField
            control={control}
            name="notifications.email.recipients"
            label={t("siteSettings.notifications.fields.emailRecipients")}
            placeholder={t(
              "siteSettings.notifications.placeholders.emailRecipients",
            )}
            hint={t("siteSettings.notifications.hints.multipleValues")}
            multiline
            rows={3}
          />

          <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-700">
            <button
              type="button"
              onClick={testEmail}
              disabled={
                testingEmail || hasUnsavedChanges || !passwordConfigured
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#0979c4] px-5 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4] hover:!text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testingEmail ? (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
                />
              ) : (
                <FiSend aria-hidden="true" />
              )}

              <span>
                {testingEmail
                  ? t("siteSettings.notifications.actions.testingEmail")
                  : t("siteSettings.notifications.actions.testEmail")}
              </span>
            </button>
          </div>
        </div>
      </AdminSettingsSection>

      <AdminSettingsSection
        title={t("siteSettings.notifications.line.title")}
        description={t("siteSettings.notifications.line.description")}
      >
        <div
          className={[
            "space-y-6 transition-opacity",

            lineEnabled ? "opacity-100" : "opacity-70",
          ].join(" ")}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                <FiMessageCircle aria-hidden="true" />
              </span>

              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  {t("siteSettings.notifications.line.messagingApiTitle")}
                </h3>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {t("siteSettings.notifications.line.messagingApiDescription")}
                </p>
              </div>
            </div>

            <SecretStatus
              configured={tokenConfigured}
              configuredLabel={t(
                "siteSettings.notifications.status.tokenConfigured",
              )}
              missingLabel={t("siteSettings.notifications.status.tokenMissing")}
            />
          </div>

          <AdminFormField
            control={control}
            name="notifications.line.channelAccessToken"
            label={t("siteSettings.notifications.fields.lineToken")}
            placeholder={
              tokenConfigured
                ? t("siteSettings.notifications.placeholders.secretConfigured")
                : t("siteSettings.notifications.placeholders.lineToken")
            }
            hint={t("siteSettings.notifications.hints.secret")}
            type="password"
            autoComplete="new-password"
          />

          <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  {t("siteSettings.notifications.line.loginTitle")}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {t("siteSettings.notifications.line.loginDescription")}
                </p>
              </div>

              <SecretStatus
                configured={loginSecretConfigured}
                configuredLabel={t(
                  "siteSettings.notifications.status.loginSecretConfigured",
                )}
                missingLabel={t(
                  "siteSettings.notifications.status.loginSecretMissing",
                )}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <AdminFormField
                control={control}
                name="notifications.line.loginChannelId"
                label={t(
                  "siteSettings.notifications.fields.lineLoginChannelId",
                )}
                placeholder="1234567890"
                autoComplete="off"
              />

              <AdminFormField
                control={control}
                name="notifications.line.loginChannelSecret"
                label={t(
                  "siteSettings.notifications.fields.lineLoginChannelSecret",
                )}
                placeholder={
                  loginSecretConfigured
                    ? t(
                        "siteSettings.notifications.placeholders.secretConfigured",
                      )
                    : t(
                        "siteSettings.notifications.placeholders.lineLoginChannelSecret",
                      )
                }
                hint={t("siteSettings.notifications.hints.secret")}
                type="password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
            <LineRecipientSelector
              control={control}
              recipients={lineRecipients}
              loading={loadingLineRecipients}
              loadError={lineRecipientsError}
              onReload={() => setRecipientReloadKey((current) => current + 1)}
            />
          </div>

          <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-700">
            <button
              type="button"
              onClick={testLine}
              disabled={
                testingLine ||
                hasUnsavedChanges ||
                !tokenConfigured ||
                !selectedLineRecipients.length
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-600 px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-600 hover:!text-white disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-300"
            >
              {testingLine ? (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
                />
              ) : (
                <FiSend aria-hidden="true" />
              )}

              <span>
                {testingLine
                  ? t("siteSettings.notifications.actions.testingLine")
                  : t("siteSettings.notifications.actions.testLine")}
              </span>
            </button>
          </div>
        </div>
      </AdminSettingsSection>
    </div>
  );
}

export function NotificationTabIcon() {
  return <FiBell aria-hidden="true" />;
}
