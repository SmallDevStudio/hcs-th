import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import { adminDb } from "@/lib/firebase/admin";
import { getAuditLogs } from "@/services/audit/audit-query.service";

const DASHBOARD_COLLECTIONS = {
  products: {
    collection: COLLECTIONS.PRODUCTS,
    entityType: "product",
  },

  categories: {
    collection: COLLECTIONS.CATEGORIES,
    entityType: "category",
  },

  projects: {
    collection: COLLECTIONS.PROJECTS,
    entityType: "project",
  },

  media: {
    collection: COLLECTIONS.MEDIA,
    entityType: "media",
  },
};

async function countCollection(collectionName) {
  const snapshot = await adminDb.collection(collectionName).count().get();

  return snapshot.data().count || 0;
}

async function countTrashByEntityType(entityType) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.TRASH)
    .where("entityType", "==", entityType)
    .count()
    .get();

  return snapshot.data().count || 0;
}

async function getActiveCollectionCount({ collection, entityType }) {
  const [totalCount, trashCount] = await Promise.all([
    countCollection(collection),
    countTrashByEntityType(entityType),
  ]);

  return Math.max(0, totalCount - trashCount);
}

export async function getAdminDashboardData() {
  const [products, categories, projects, media, auditResult] =
    await Promise.all([
      getActiveCollectionCount(DASHBOARD_COLLECTIONS.products),

      getActiveCollectionCount(DASHBOARD_COLLECTIONS.categories),

      getActiveCollectionCount(DASHBOARD_COLLECTIONS.projects),

      getActiveCollectionCount(DASHBOARD_COLLECTIONS.media),

      getAuditLogs({
        limit: 6,
        cursor: undefined,
        action: undefined,
        entityType: undefined,
        actorUid: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      }),
    ]);

  return {
    statistics: {
      products,
      categories,
      projects,
      media,
    },

    recentActivity: auditResult.items,
  };
}
