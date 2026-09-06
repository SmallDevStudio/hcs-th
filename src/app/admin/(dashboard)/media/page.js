import { MediaLibraryClient } from "@/components/admin/media/MediaLibraryClient";
import { ADMIN_PERMISSIONS, hasPermission } from "@/constants/admin";
import { MEDIA_STATUSES } from "@/constants/media";
import { requireAdminPagePermission } from "@/lib/auth/admin-page-auth";
import { getMediaAssets } from "@/services/media/media.service";

export const metadata = {
  title: "Media Library",
};

export default async function AdminMediaPage() {
  const admin = await requireAdminPagePermission(ADMIN_PERMISSIONS.MEDIA_VIEW);

  const result = await getMediaAssets({
    limit: 24,
    cursor: undefined,
    type: undefined,
    folder: undefined,
    status: MEDIA_STATUSES.ACTIVE,
    search: undefined,
    usage: "all",
  });

  return (
    <MediaLibraryClient
      initialItems={result.items}
      initialPagination={result.pagination}
      canUpload={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.MEDIA_UPLOAD,
      )}
      canUpdate={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.MEDIA_UPDATE,
      )}
      canDelete={hasPermission(
        admin.permissions,
        ADMIN_PERMISSIONS.MEDIA_DELETE,
      )}
    />
  );
}
