import { revalidatePath, revalidateTag } from "next/cache";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { STANDARD_CACHE_TAG } from "@/constants/standards";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requirePermission } from "@/lib/auth/current-admin";
import {
  standardIdSchema,
  updateStandardSchema,
} from "@/modules/standards/standard.schema";
import {
  deleteStandard,
  getStandardById,
  updateStandard,
} from "@/services/standards/standard.service";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

function revalidateStandardContent() {
  revalidateTag(STANDARD_CACHE_TAG, "max");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");

  revalidatePath("/en/standards");
  revalidatePath("/th/standards");

  revalidatePath("/en/products");
  revalidatePath("/th/products");
}

async function parseStandardId(params) {
  const resolvedParams = await params;

  return standardIdSchema.parse(resolvedParams).standardId;
}

export async function GET(request, { params }) {
  return withApiHandler(async () => {
    await requirePermission(ADMIN_PERMISSIONS.STANDARDS_VIEW);

    const standardId = await parseStandardId(params);

    const standard = await getStandardById(standardId);

    return apiSuccess({
      message: "Standard retrieved successfully",

      data: standard,
    });
  });
}

export async function PATCH(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.STANDARDS_UPDATE);

    const standardId = await parseStandardId(params);

    const payload = updateStandardSchema.parse(await request.json());

    const standard = await updateStandard({
      standardId,

      input: payload,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateStandardContent();

    return apiSuccess({
      message: "Standard updated successfully",

      data: standard,
    });
  });
}

export async function DELETE(request, { params }) {
  return withApiHandler(async () => {
    const admin = await requirePermission(ADMIN_PERMISSIONS.STANDARDS_DELETE);

    const standardId = await parseStandardId(params);

    const result = await deleteStandard({
      standardId,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    revalidateStandardContent();

    return apiSuccess({
      message: "Standard moved to trash successfully",

      data: result,
    });
  });
}
