"use client";

import { useState } from "react";

import { AdminLogoutButton } from "@/components/admin/auth/AdminLogoutButton";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";

export function AdminShell({ admin, children }) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  function openNavigation() {
    setNavigationOpen(true);
  }

  function closeNavigation() {
    setNavigationOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#06111e]">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <AdminSidebar admin={admin} />
      </div>

      {navigationOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeNavigation}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
          />

          <div className="absolute inset-y-0 left-0">
            <AdminSidebar
              admin={admin}
              mobile
              onClose={closeNavigation}
              onNavigate={closeNavigation}
            />
          </div>
        </div>
      ) : null}

      <div className="min-h-screen lg:pl-[280px]">
        <AdminHeader admin={admin} onOpenNavigation={openNavigation} />

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>

        <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-[#071522] xl:hidden">
          <AdminLogoutButton />
        </div>
      </div>
    </div>
  );
}
