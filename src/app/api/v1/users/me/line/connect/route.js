import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { createLineConnectRequest } from "@/services/line/line-account.service";

const LINE_OAUTH_STATE_COOKIE = "hcs_line_oauth_state";

const LINE_OAUTH_MAX_AGE_SECONDS = 10 * 60;

function createLoginRedirect(request) {
  const loginUrl = new URL("/admin/login", request.url);

  loginUrl.searchParams.set("callbackUrl", "/admin/account");

  return NextResponse.redirect(loginUrl);
}

function createAccountErrorRedirect(request, reason) {
  const accountUrl = new URL("/admin/account", request.url);

  accountUrl.searchParams.set("line", "error");

  accountUrl.searchParams.set("reason", reason);

  return NextResponse.redirect(accountUrl);
}

export async function GET(request) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return createLoginRedirect(request);
  }

  try {
    const connectionRequest = await createLineConnectRequest({
      requestUrl: request.url,

      userId: admin.uid,
    });

    const response = NextResponse.redirect(connectionRequest.authorizationUrl);

    response.cookies.set(LINE_OAUTH_STATE_COOKIE, connectionRequest.state, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/api/v1/users/me/line",

      maxAge: LINE_OAUTH_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Unable to start LINE account connection:", error);

    return createAccountErrorRedirect(request, "configuration");
  }
}
