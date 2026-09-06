import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { ADMIN_PERMISSIONS } from "@/constants/admin";
import { COLLECTIONS } from "@/constants/collections";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireCurrentAdmin } from "@/lib/auth/current-admin";
import { adminDb } from "@/lib/firebase/admin";

const preferenceSchema = z.object({
  preferredLocale: z.enum(["en", "th"]),
});

export async function PATCH(request) {
  return withApiHandler(async () => {
    const admin = await requireCurrentAdmin();
    const payload = preferenceSchema.parse(await request.json());

    const userReference = adminDb.collection(COLLECTIONS.USERS).doc(admin.uid);

    const auditReference = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();

    const batch = adminDb.batch();

    batch.update(userReference, {
      preferredLocale: payload.preferredLocale,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: admin.uid,
    });

    batch.set(auditReference, {
      action: "USER_PREFERENCE_UPDATE",
      entityType: "user",
      entityId: admin.uid,

      actor: {
        uid: admin.uid,
        email: admin.email,
        displayName: admin.displayName || "",
        role: admin.role,
      },

      changes: {
        preferredLocale: {
          from: admin.preferredLocale || "en",
          to: payload.preferredLocale,
        },
      },

      metadata: {
        source: "admin",
      },

      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return apiSuccess({
      message: "Preferences updated successfully",
      data: {
        preferredLocale: payload.preferredLocale,
      },
    });
  });
}
