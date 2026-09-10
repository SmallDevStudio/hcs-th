import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  updateUserGroupSchema,
  userGroupIdSchema,
} from "@/modules/user-groups/user-group.schema";
import {
  deleteUserGroup,
  getUserGroupById,
  updateUserGroup,
} from "@/services/user-groups/user-group.service";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

async function parseGroupId(params) {
  const values = await params;

  return userGroupIdSchema.parse({
    groupId: values.groupId,
  }).groupId;
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.GROUPS_VIEW);

    const groupId = await parseGroupId(params);

    const group = await getUserGroupById(groupId);

    return apiSuccess({
      message: "Permission group retrieved successfully",

      data: group,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.GROUPS_UPDATE);

    const groupId = await parseGroupId(params);

    const payload = updateUserGroupSchema.parse(await request.json());

    const group = await updateUserGroup({
      groupId,

      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "Permission group updated successfully",

      data: group,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.GROUPS_DELETE);

    const groupId = await parseGroupId(params);

    const result = await deleteUserGroup({
      groupId,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    return apiSuccess({
      message: "Permission group permanently deleted successfully",

      data: result,
    });
  });
}
