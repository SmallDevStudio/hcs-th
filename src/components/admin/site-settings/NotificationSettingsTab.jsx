"use client";

import { useState } from "react";
import { useWatch } from "react-hook-form";
import {
  FiBell,
  FiCheckCircle,
  FiMail,
  FiMessageCircle,
  FiSend,
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

export function NotificationSettingsTab({ control, hasUnsavedChanges }) {
  const { t } = useTranslation("admin");

  const [testingEmail, setTestingEmail] = useState(false);

  const [testingLine, setTestingLine] = useState(false);

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

  const emailRecipients =
    useWatch({
      control,
      name: "notifications.email.recipients",
    }) || "";

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

          <AdminFormField
            control={control}
            name="notifications.line.targetIds"
            label={t("siteSettings.notifications.fields.lineTargets")}
            placeholder={t(
              "siteSettings.notifications.placeholders.lineTargets",
            )}
            hint={t("siteSettings.notifications.hints.lineTargets")}
            multiline
            rows={4}
          />

          <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-700">
            <button
              type="button"
              onClick={testLine}
              disabled={testingLine || hasUnsavedChanges || !tokenConfigured}
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
