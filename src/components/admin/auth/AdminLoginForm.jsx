"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FiAlertCircle, FiArrowRight, FiLock, FiMail } from "react-icons/fi";

import { firebaseAuth } from "@/lib/firebase/client";
import { adminLoginSchema } from "@/modules/auth/schemas/login.schema";
import { apiClient } from "@/services/http/axios";

function getLoginErrorKey(error) {
  const errorKeys = {
    "auth/invalid-credential": "login.errors.invalidCredential",

    "auth/invalid-email": "login.errors.invalidEmail",

    "auth/user-disabled": "login.errors.userDisabled",

    "auth/too-many-requests": "login.errors.tooManyRequests",

    "auth/network-request-failed": "login.errors.network",
  };

  return errorKeys[error?.code] || "login.errors.default";
}

function translateValidationError(t, message) {
  if (typeof message === "string" && message.startsWith("login.")) {
    return t(message);
  }

  return message;
}

export function AdminLoginForm() {
  const router = useRouter();
  const { t } = useTranslation("admin");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        values.email,
        values.password,
      );

      const idToken = await userCredential.user.getIdToken(true);

      const sessionResponse = await apiClient.post("/auth/session", {
        idToken,
      });

      const mustChangePassword = Boolean(
        sessionResponse?.data?.user?.mustChangePassword,
      );

      if (mustChangePassword) {
        router.replace("/admin/change-password");
        router.refresh();

        return;
      }

      await signOut(firebaseAuth);

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error) {
      const apiMessage = error?.response?.data?.message;

      setError("root", {
        type: "server",

        message: apiMessage || t(getLoginErrorKey(error)),
      });
    }
  }

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {errors.root?.message ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          <FiAlertCircle
            className="mt-0.5 shrink-0 text-lg"
            aria-hidden="true"
          />

          <span>{errors.root.message}</span>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="admin-email"
          className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          {t("login.email")}
        </label>

        <div className="relative">
          <FiMail
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400"
            aria-hidden="true"
          />

          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            placeholder={t("login.emailPlaceholder")}
            aria-invalid={Boolean(errors.email)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            {...register("email")}
          />
        </div>

        {errors.email?.message ? (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
            {translateValidationError(t, errors.email.message)}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          {t("login.password")}
        </label>

        <div className="relative">
          <FiLock
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400"
            aria-hidden="true"
          />

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder={t("login.passwordPlaceholder")}
            aria-invalid={Boolean(errors.password)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            {...register("password")}
          />
        </div>

        {errors.password?.message ? (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
            {translateValidationError(t, errors.password.message)}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold !text-white shadow-lg shadow-[#0979c4]/20 transition hover:bg-[#0769aa] focus:outline-none focus:ring-4 focus:ring-[#0979c4]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{isSubmitting ? t("login.submitting") : t("login.submit")}</span>

        {!isSubmitting ? (
          <FiArrowRight className="text-lg" aria-hidden="true" />
        ) : (
          <span
            className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          />
        )}
      </button>

      <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
        {t("login.restricted")}
      </p>
    </form>
  );
}
