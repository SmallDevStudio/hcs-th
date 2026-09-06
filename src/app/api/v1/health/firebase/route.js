import { NotFoundError } from "@/lib/api/errors";
import { apiSuccess, withApiHandler } from "@/lib/api/response";
import { adminAuth, adminBucket, adminDb } from "@/lib/firebase/admin";

export async function GET() {
  return withApiHandler(async () => {
    if (process.env.NODE_ENV === "production") {
      throw new NotFoundError();
    }

    const [authResult, firestoreResult, storageResult] = await Promise.all([
      adminAuth.listUsers(1),

      adminDb.collection("_system").limit(1).get(),

      adminBucket.exists(),
    ]);

    return apiSuccess({
      message: "Firebase Admin connection successful",
      data: {
        auth: {
          connected: true,
          checkedUsers: authResult.users.length,
        },

        firestore: {
          connected: true,
          checkedDocuments: firestoreResult.size,
        },

        storage: {
          connected: true,
          bucketExists: storageResult[0],
        },
      },
    });
  });
}
