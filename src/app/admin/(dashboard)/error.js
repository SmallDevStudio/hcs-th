"use client";

import { AdminErrorState } from "@/components/admin/common/AdminErrorState";

export default function AdminDashboardError({ error, reset }) {
  return <AdminErrorState error={error} reset={reset} />;
}
