"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useTranslation } from "react-i18next";
import { FiLogOut } from "react-icons/fi";

import { apiClient } from "@/services/http/axios";

function LogoutButtonContent() {
  const { pending } = useFormStatus();
  const { t } = useTranslation("admin");

  return (
    <>
      <FiLogOut className="text-lg" aria-hidden="true" />

      <span>{pending ? t("common.loggingOut") : t("common.logout")}</span>
    </>
  );
}

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await apiClient.delete("/auth/session");
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
      >
        <LogoutButtonContent />
      </button>
    </form>
  );
}
