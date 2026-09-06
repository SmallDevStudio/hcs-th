import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { requireCurrentAdmin } from "@/lib/auth/current-admin";

export async function GET() {
  return withApiHandler(async () => {
    const admin = await requireCurrentAdmin();

    return apiSuccess({
      message: "Current admin retrieved successfully",

      data: {
        user: admin,
      },
    });
  });
}
