import { AccountClient } from "@/components/admin/account/AccountClient";
import { requireAdminPage } from "@/lib/auth/admin-page-auth";
import { getUserLineConnection } from "@/services/line/line-account.service";

export default async function AdminAccountPage() {
  const admin = await requireAdminPage();

  const lineConnection = await getUserLineConnection(admin.uid);

  return <AccountClient admin={admin} initialLineConnection={lineConnection} />;
}
