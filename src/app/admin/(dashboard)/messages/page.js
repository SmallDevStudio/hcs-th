import { MessagesClient } from "@/components/admin/messages/MessagesClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getContactMessages } from "@/services/contact-messages/contact-message-query.service";

export const metadata = {
  title: "Contact Messages",
};

function normalizePermissions(authentication) {
  const permissions =
    authentication?.permissions ||
    authentication?.userPermissions ||
    authentication?.user?.permissions ||
    authentication?.session?.user?.permissions ||
    [];

  if (Array.isArray(permissions)) {
    return permissions;
  }

  if (permissions instanceof Set) {
    return Array.from(permissions);
  }

  return [];
}

export default async function AdminMessagesPage() {
  const authentication = await requireAdminPagePermission(
    ADMIN_PERMISSIONS.MESSAGES_VIEW,
  );

  const permissions = normalizePermissions(authentication);

  const result = await getContactMessages({
    limit: 25,
    cursor: undefined,
    status: undefined,
    search: undefined,
  });

  return (
    <MessagesClient
      initialItems={result.items}
      initialPagination={result.pagination}
      canUpdate={hasPermission(permissions, ADMIN_PERMISSIONS.MESSAGES_UPDATE)}
      canDelete={hasPermission(permissions, ADMIN_PERMISSIONS.MESSAGES_DELETE)}
    />
  );
}
