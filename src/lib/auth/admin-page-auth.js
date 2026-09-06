import "server-only";

import { redirect } from "next/navigation";

import { hasPermission } from "@/constants/admin";
import { getCurrentAdmin } from "@/lib/auth/current-admin";

export async function requireAdminPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function requireAdminPagePermission(requiredPermission) {
  const admin = await requireAdminPage();

  if (!hasPermission(admin.permissions, requiredPermission)) {
    redirect("/admin/forbidden");
  }

  return admin;
}
