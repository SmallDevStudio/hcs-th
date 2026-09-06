import "server-only";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { serverEnv } from "@/config/env.server";

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: serverEnv.AUTH_SESSION_MAX_AGE,
};

export async function createSessionCookie(idToken) {
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: serverEnv.sessionMaxAgeMilliseconds,
  });
}

export async function setSessionCookie(sessionCookie) {
  const cookieStore = await cookies();

  cookieStore.set(
    serverEnv.AUTH_SESSION_COOKIE_NAME,
    sessionCookie,
    sessionCookieOptions,
  );
}

export async function createAndSetSession(idToken) {
  const sessionCookie = await createSessionCookie(idToken);

  await setSessionCookie(sessionCookie);

  return sessionCookie;
}

export async function getSessionCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(serverEnv.AUTH_SESSION_COOKIE_NAME)?.value || null;
}

export async function verifySessionCookie({ checkRevoked = true } = {}) {
  const sessionCookie = await getSessionCookie();

  if (!sessionCookie) {
    return null;
  }

  try {
    return await adminAuth.verifySessionCookie(sessionCookie, checkRevoked);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const decodedToken = await verifySessionCookie();

  if (!decodedToken) {
    throw new Error("UNAUTHENTICATED");
  }

  return decodedToken;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(serverEnv.AUTH_SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function revokeUserSessions(uid) {
  await adminAuth.revokeRefreshTokens(uid);
}
