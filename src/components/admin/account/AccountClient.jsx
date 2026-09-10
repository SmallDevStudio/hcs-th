"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiKey,
  FiLink,
  FiLock,
  FiMessageCircle,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { TfiUnlink } from "react-icons/tfi";

import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { firebaseAuth } from "@/lib/firebase/client";
import { changeOwnPasswordSchema } from "@/modules/users/user.schema";
import { apiClient } from "@/services/http/axios";
import Link from "next/link";

function getFirebasePasswordErrorKey(error) {
  const errorKeys = {
    "auth/invalid-credential": "account.password.errors.invalidCurrentPassword",

    "auth/wrong-password": "account.password.errors.invalidCurrentPassword",

    "auth/weak-password": "account.password.errors.weakPassword",

    "auth/too-many-requests": "account.password.errors.tooManyRequests",

    "auth/requires-recent-login": "account.password.errors.reauthenticate",

    "auth/network-request-failed": "account.password.errors.network",
  };

  return errorKeys[error?.code] || "account.password.errors.default";
}

function translateValidationError(t, message) {
  if (typeof message === "string" && message.startsWith("account.")) {
    return t(message);
  }

  return message;
}

function getInitial(value) {
  return String(value || "A")
    .trim()
    .charAt(0)
    .toUpperCase();
}

function AccountSummary({ admin }) {
  const { t } = useTranslation("admin");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#071522] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[#0979c4]/10 text-3xl font-extrabold text-[#0979c4] dark:bg-[#0979c4]/20 dark:text-sky-300">
          {getInitial(admin.displayName || admin.email)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0979c4]">
            {t("account.profile.eyebrow")}
          </p>

          <h2 className="mt-1 truncate text-2xl font-extrabold text-slate-950 dark:text-white">
            {admin.displayName || admin.email}
          </h2>

          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
            {admin.email}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0979c4]/10 px-3 py-1.5 text-xs font-bold text-[#0979c4] dark:bg-[#0979c4]/20 dark:text-sky-300">
              <FiShield aria-hidden="true" />

              {t(`roles.${admin.role}`, {
                defaultValue: admin.role,
              })}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <FiCheckCircle aria-hidden="true" />

              {t("account.profile.active")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PasswordField({ id, label, error, register, autoComplete }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}
      </label>

      <div className="relative">
        <FiLock
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400"
        />

        <input
          id={id}
          type="password"
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          {...register}
        />
      </div>

      {error ? (
        <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordSection({ admin }) {
  const { t } = useTranslation("admin");

  const {
    register,
    handleSubmit,
    reset,
    setError,

    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changeOwnPasswordSchema),

    defaultValues: {
      currentPassword: "",

      newPassword: "",

      confirmPassword: "",
    },
  });

  async function onSubmit(values) {
    let userCredential = null;

    try {
      userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        admin.email,
        values.currentPassword,
      );

      await updatePassword(userCredential.user, values.newPassword);

      const idToken = await userCredential.user.getIdToken(true);

      await apiClient.post("/users/me/password-change-complete", {
        idToken,
      });

      reset();

      toast.success(t("account.password.messages.changed"));
    } catch (error) {
      const message =
        error?.message && error?.status
          ? error.message
          : t(getFirebasePasswordErrorKey(error));

      setError("root", {
        type: "server",

        message,
      });
    } finally {
      if (firebaseAuth.currentUser) {
        await signOut(firebaseAuth).catch(() => {});
      }
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#071522] sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
          <FiKey aria-hidden="true" />
        </span>

        <div>
          <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
            {t("account.password.title")}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("account.password.description")}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 space-y-5"
      >
        {errors.root?.message ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <FiAlertCircle
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-lg"
            />

            <span>{errors.root.message}</span>
          </div>
        ) : null}

        <PasswordField
          id="account-current-password"
          label={t("account.password.currentPassword")}
          autoComplete="current-password"
          register={register("currentPassword")}
          error={translateValidationError(t, errors.currentPassword?.message)}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <PasswordField
            id="account-new-password"
            label={t("account.password.newPassword")}
            autoComplete="new-password"
            register={register("newPassword")}
            error={translateValidationError(t, errors.newPassword?.message)}
          />

          <PasswordField
            id="account-confirm-password"
            label={t("account.password.confirmPassword")}
            autoComplete="new-password"
            register={register("confirmPassword")}
            error={translateValidationError(t, errors.confirmPassword?.message)}
          />
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white shadow-md shadow-[#0979c4]/20 transition hover:bg-[#0769aa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              <FiKey aria-hidden="true" />
            )}

            <span>
              {isSubmitting
                ? t("account.password.changing")
                : t("account.password.action")}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

function LineSection({ initialConnection }) {
  const { t } = useTranslation("admin");

  const [connection, setConnection] = useState(initialConnection);

  const [disconnecting, setDisconnecting] = useState(false);

  const connected = connection?.status === "connected";

  async function disconnectLine() {
    const confirmed = window.confirm(t("account.line.disconnectConfirmation"));

    if (!confirmed) {
      return;
    }

    setDisconnecting(true);

    try {
      const response = await apiClient.delete("/users/me/line");

      setConnection(response.data);

      toast.success(t("account.line.messages.disconnected"));
    } catch (error) {
      toast.error(
        error?.message || t("account.line.messages.disconnectFailed"),
      );
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#071522] sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <FiMessageCircle aria-hidden="true" />
        </span>

        <div>
          <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
            {t("account.line.title")}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("account.line.description")}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        {connected ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              {getInitial(connection.displayName || "L")}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-extrabold text-slate-950 dark:text-white">
                  {connection.displayName || t("account.line.lineAccount")}
                </p>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <FiCheckCircle aria-hidden="true" />

                  {t("account.line.connected")}
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {t("account.line.connectedDescription")}
              </p>
            </div>

            <button
              type="button"
              onClick={disconnectLine}
              disabled={disconnecting}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:!text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/70 dark:bg-slate-900 dark:text-red-400"
            >
              {disconnecting ? (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
                />
              ) : (
                <TfiUnlink aria-hidden="true" />
              )}

              <span>
                {disconnecting
                  ? t("account.line.disconnecting")
                  : t("account.line.disconnect")}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xl text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <FiUser aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-slate-950 dark:text-white">
                {t("account.line.notConnected")}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {t("account.line.notConnectedDescription")}
              </p>
            </div>

            <Link
              href="/api/v1/users/me/line/connect"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold !text-white shadow-sm transition hover:bg-emerald-700"
            >
              <FiLink aria-hidden="true" />

              <span>{t("account.line.connect")}</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export function AccountClient({ admin, initialLineConnection }) {
  const { t } = useTranslation("admin");

  const router = useRouter();

  const searchParams = useSearchParams();

  const lineResult = searchParams.get("line");

  useEffect(() => {
    if (!lineResult) {
      return;
    }

    if (lineResult === "connected") {
      toast.success(t("account.line.messages.connected"));
    } else if (lineResult === "cancelled") {
      toast.info(t("account.line.messages.cancelled"));
    } else {
      toast.error(t("account.line.messages.connectFailed"));
    }

    router.replace("/admin/account", {
      scroll: false,
    });

    router.refresh();
  }, [lineResult, router, t]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0979c4]">
          {t("account.eyebrow")}
        </p>

        <h1 className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
          {t("account.title")}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {t("account.description")}
        </p>
      </header>

      <AccountSummary admin={admin} />

      <div className="grid gap-6 xl:grid-cols-2">
        <PasswordSection admin={admin} />

        <LineSection initialConnection={initialLineConnection} />
      </div>
    </div>
  );
}
