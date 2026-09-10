"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiShield,
} from "react-icons/fi";

import { firebaseAuth } from "@/lib/firebase/client";
import { apiClient } from "@/services/http/axios";

function getErrorMessage(error, t) {
  const errorMessages = {
    "auth/invalid-credential": "forcedPassword.errors.invalidCredential",

    "auth/wrong-password": "forcedPassword.errors.invalidCredential",

    "auth/weak-password": "forcedPassword.errors.weakPassword",

    "auth/requires-recent-login":
      "forcedPassword.errors.reauthenticationRequired",

    "auth/network-request-failed": "forcedPassword.errors.network",
  };

  const translationKey = errorMessages[error?.code];

  if (translationKey) {
    return t(translationKey);
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    t("forcedPassword.errors.default")
  );
}

function PasswordField({
  field,
  label,
  value,
  visible,
  disabled,
  autoComplete,
  showLabel,
  hideLabel,
  onChange,
  onToggle,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
        {label}
        <span className="ml-1 text-red-500">*</span>
      </span>

      <div className="relative">
        <FiLock
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={visible ? "text" : "password"}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          minLength={field === "currentPassword" ? undefined : 8}
          maxLength={128}
          onChange={(event) => onChange(field, event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <button
          type="button"
          onClick={() => onToggle(field)}
          aria-label={visible ? hideLabel : showLabel}
          className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {visible ? (
            <FiEyeOff aria-hidden="true" />
          ) : (
            <FiEye aria-hidden="true" />
          )}
        </button>
      </div>
    </label>
  );
}

export function ForcedPasswordChangeForm({ email }) {
  const router = useRouter();

  const { t } = useTranslation("admin");

  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visibility, setVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  function updateValue(field, value) {
    setValues((current) => ({
      ...current,

      [field]: value,
    }));

    setErrorMessage("");
  }

  function toggleVisibility(field) {
    setVisibility((current) => ({
      ...current,

      [field]: !current[field],
    }));
  }

  function validateValues() {
    if (!values.currentPassword) {
      setErrorMessage(t("forcedPassword.validation.currentRequired"));

      return false;
    }

    if (values.newPassword.length < 8) {
      setErrorMessage(t("forcedPassword.validation.minimum"));

      return false;
    }

    if (values.newPassword.length > 128) {
      setErrorMessage(t("forcedPassword.validation.maximum"));

      return false;
    }

    if (values.newPassword !== values.confirmPassword) {
      setErrorMessage(t("forcedPassword.validation.notMatched"));

      return false;
    }

    if (values.currentPassword === values.newPassword) {
      setErrorMessage(t("forcedPassword.validation.mustBeDifferent"));

      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateValues()) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      let firebaseUser = firebaseAuth.currentUser;

      if (!firebaseUser || firebaseUser.email !== email) {
        const credential = await signInWithEmailAndPassword(
          firebaseAuth,
          email,
          values.currentPassword,
        );

        firebaseUser = credential.user;
      } else {
        const credential = EmailAuthProvider.credential(
          email,
          values.currentPassword,
        );

        await reauthenticateWithCredential(firebaseUser, credential);
      }

      await updatePassword(firebaseUser, values.newPassword);

      const idToken = await firebaseUser.getIdToken(true);

      await apiClient.post("/users/me/password-change-complete", {
        idToken,
      });

      await signOut(firebaseAuth);

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6">
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-xl text-primary">
          <FiShield aria-hidden="true" />
        </div>

        <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          {t("forcedPassword.eyebrow")}
        </p>

        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          {t("forcedPassword.title")}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {t("forcedPassword.description")}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {t("forcedPassword.account")}
        </p>

        <p className="mt-1 break-all text-sm font-extrabold text-slate-900 dark:text-white">
          {email}
        </p>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <FiAlertCircle
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-lg"
          />

          <span>{errorMessage}</span>
        </div>
      ) : null}

      <PasswordField
        field="currentPassword"
        label={t("forcedPassword.currentPassword")}
        value={values.currentPassword}
        visible={visibility.currentPassword}
        disabled={submitting}
        autoComplete="current-password"
        showLabel={t("forcedPassword.showPassword")}
        hideLabel={t("forcedPassword.hidePassword")}
        onChange={updateValue}
        onToggle={toggleVisibility}
      />

      <PasswordField
        field="newPassword"
        label={t("forcedPassword.newPassword")}
        value={values.newPassword}
        visible={visibility.newPassword}
        disabled={submitting}
        autoComplete="new-password"
        showLabel={t("forcedPassword.showPassword")}
        hideLabel={t("forcedPassword.hidePassword")}
        onChange={updateValue}
        onToggle={toggleVisibility}
      />

      <PasswordField
        field="confirmPassword"
        label={t("forcedPassword.confirmPassword")}
        value={values.confirmPassword}
        visible={visibility.confirmPassword}
        disabled={submitting}
        autoComplete="new-password"
        showLabel={t("forcedPassword.showPassword")}
        hideLabel={t("forcedPassword.hidePassword")}
        onChange={updateValue}
        onToggle={toggleVisibility}
      />

      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
        <FiCheckCircle
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-base"
        />

        <span>{t("forcedPassword.requirements")}</span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <span
            className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          />
        ) : (
          <FiShield aria-hidden="true" />
        )}

        <span>
          {submitting
            ? t("forcedPassword.submitting")
            : t("forcedPassword.submit")}
        </span>
      </button>
    </form>
  );
}
