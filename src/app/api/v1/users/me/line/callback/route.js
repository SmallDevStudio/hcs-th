import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { connectUserLineAccount } from "@/services/line/line-account.service";

const LINE_OAUTH_STATE_COOKIE = "hcs_line_oauth_state";

function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

function clearOAuthStateCookie(response) {
  response.cookies.set(LINE_OAUTH_STATE_COOKIE, "", {
    httpOnly: true,

    secure: process.env.NODE_ENV === "production",

    sameSite: "lax",

    path: "/api/v1/users/me/line",

    maxAge: 0,

    expires: new Date(0),
  });
}

function createAccountRedirect(request, status, reason = "") {
  const accountUrl = new URL("/admin/account", request.url);

  accountUrl.searchParams.set("line", status);

  if (reason) {
    accountUrl.searchParams.set("reason", reason);
  }

  return NextResponse.redirect(accountUrl);
}

function createLoginRedirect(request) {
  const loginUrl = new URL("/admin/login", request.url);

  loginUrl.searchParams.set("callbackUrl", "/admin/account");

  return NextResponse.redirect(loginUrl);
}

export async function GET(request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    const response = createLoginRedirect(request);

    clearOAuthStateCookie(response);

    return response;
  }

  const requestUrl = new URL(request.url);

  const lineError = requestUrl.searchParams.get("error");

  if (lineError) {
    const response = createAccountRedirect(request, "cancelled");

    clearOAuthStateCookie(response);

    return response;
  }

  const code = requestUrl.searchParams.get("code") || "";

  const state = requestUrl.searchParams.get("state") || "";

  const storedState = request.cookies.get(LINE_OAUTH_STATE_COOKIE)?.value || "";

  try {
    await connectUserLineAccount({
      requestUrl: request.url,

      code,

      state,

      storedState,

      actor: admin,

      requestMetadata: getRequestMetadata(request),
    });

    const response = createAccountRedirect(request, "connected");

    clearOAuthStateCookie(response);

    return response;
  } catch (error) {
    console.error("Unable to complete LINE account connection:", error);

    const response = createAccountRedirect(request, "error", "connection");

    clearOAuthStateCookie(response);

    return response;
  }
}
