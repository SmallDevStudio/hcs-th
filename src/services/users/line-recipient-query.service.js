import "server-only";

import { ADMIN_ROLES, USER_STATUSES } from "@/constants/admin";
import { COLLECTIONS } from "@/constants/collections";
import { adminDb } from "@/lib/firebase/admin";

function serializeTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function isConnectedLineUser(userData) {
  return (
    userData?.status === USER_STATUSES.ACTIVE &&
    userData?.lineConnection?.status === "connected" &&
    Boolean(String(userData?.lineConnection?.userId || "").trim())
  );
}

function canActorViewUser({ actor, userData }) {
  if (actor.role === ADMIN_ROLES.SUPERADMIN) {
    return true;
  }

  return userData.role !== ADMIN_ROLES.SUPERADMIN;
}

function serializeLineRecipient(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,

    displayName: data.displayName || "",

    email: data.email || "",

    photoURL: data.photoURL || null,

    role: data.role || "",

    status: data.status || "",

    lineConnection: {
      status: "connected",

      displayName: data.lineConnection?.displayName || "",

      pictureUrl: data.lineConnection?.pictureUrl || "",

      connectedAt: serializeTimestamp(data.lineConnection?.connectedAt),
    },
  };
}

export async function getConnectedLineRecipients({ actor } = {}) {
  const snapshot = await adminDb
    .collection(COLLECTIONS.USERS)
    .where("status", "==", USER_STATUSES.ACTIVE)
    .get();

  return snapshot.docs
    .filter((document) => {
      const userData = document.data();

      return (
        isConnectedLineUser(userData) &&
        canActorViewUser({
          actor,
          userData,
        })
      );
    })
    .map(serializeLineRecipient)
    .sort((firstUser, secondUser) => {
      const firstName = firstUser.displayName || firstUser.email;

      const secondName = secondUser.displayName || secondUser.email;

      const nameComparison = firstName.localeCompare(secondName, "en", {
        sensitivity: "base",
      });

      if (nameComparison !== 0) {
        return nameComparison;
      }

      return firstUser.id.localeCompare(secondUser.id);
    });
}
