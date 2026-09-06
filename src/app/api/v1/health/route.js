import { apiSuccess } from "@/lib/api/response";

export async function GET() {
  return apiSuccess({
    message: "HCS API is running",
    data: {
      service: "hcs-th",
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  });
}
