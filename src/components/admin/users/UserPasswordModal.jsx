"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEye, FiEyeOff, FiKey, FiLoader, FiSave, FiX } from "react-icons/fi";
import { toast } from "sonner";

import { setUserPassword } from "@/services/http/users.api";

export function UserPasswordModal({ user, onClose, onSaved }) {
  const { t } = useTranslation("admin");

  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
    mustChangePassword: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  function updateValue(field, value) {
    setValues((current) => ({
      ...current,

      [field]: value,
    }));
  }

  function validateValues() {
    if (values.password.length < 8) {
      toast.error(t("users.password.validation.minimum"));

      return false;
    }

    if (values.password.length > 128) {
      toast.error(t("users.password.validation.maximum"));

      return false;
    }

    if (values.password !== values.confirmPassword) {
      toast.error(t("users.password.validation.notMatched"));

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

    try {
      const savedUser = await setUserPassword({
        userId: user.uid,

        values: {
          password: values.password,

          confirmPassword: values.confirmPassword,

          mustChangePassword: values.mustChangePassword,
        },
      });

      toast.success(t("users.messages.passwordSetSuccess"));

      onSaved(savedUser);
    } catch (error) {
      toast.error(error?.message || t("users.messages.passwordSetFailed"));
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
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-password-title"
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-[#071522]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
              <FiKey aria-hidden="true" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                {t("users.password.eyebrow")}
              </p>

              <h2
                id="user-password-title"
                className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white"
              >
                {t("users.password.title")}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {user.displayName || user.email}
              </p>
            </div>
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
          <div className="space-y-5 p-5 sm:p-6">
            <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              {t("users.password.description")}
            </p>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                {t("users.password.newPassword")}
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
                  onClick={() => setShowPassword((current) => !current)}
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
                    updateValue("confirmPassword", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
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

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <input
                type="checkbox"
                checked={values.mustChangePassword}
                disabled={saving}
                onChange={(event) =>
                  updateValue("mustChangePassword", event.target.checked)
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

            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              {t("users.password.sessionWarning")}
            </p>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:justify-end sm:px-6">
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
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? (
                <FiLoader className="animate-spin" aria-hidden="true" />
              ) : (
                <FiSave aria-hidden="true" />
              )}

              <span>
                {saving ? t("users.password.saving") : t("users.password.save")}
              </span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
