import { revalidatePath, revalidateTag } from "next/cache";

import { ABOUT_PAGE_CACHE_TAG } from "@/constants/about";
import { InvalidRequestError } from "@/lib/api/errors";

export function getRequestMetadata(request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "",

    userAgent: request.headers.get("user-agent") || "",
  };
}

export function parseExpectedDraftVersion(request) {
  const ifMatch = request.headers.get("if-match");

  if (!ifMatch) {
    throw new InvalidRequestError("If-Match header is required", {
      field: "If-Match",
      code: "ABOUT_DRAFT_VERSION_REQUIRED",
    });
  }

  const normalizedValue = ifMatch
    .trim()
    .replace(/^W\//i, "")
    .replace(/^"|"$/g, "");

  if (!/^\d+$/.test(normalizedValue)) {
    throw new InvalidRequestError(
      "If-Match must contain a valid About draft version",
      {
        field: "If-Match",
        code: "ABOUT_DRAFT_VERSION_INVALID",
      },
    );
  }

  const expectedDraftVersion = Number(normalizedValue);

  if (!Number.isSafeInteger(expectedDraftVersion) || expectedDraftVersion < 0) {
    throw new InvalidRequestError(
      "If-Match must contain a valid About draft version",
      {
        field: "If-Match",
        code: "ABOUT_DRAFT_VERSION_INVALID",
      },
    );
  }

  return expectedDraftVersion;
}

export function attachAboutVersionHeaders(response, page) {
  response.headers.set("ETag", `"${Number(page?.draftVersion || 0)}"`);

  response.headers.set(
    "X-About-Draft-Version",
    String(Number(page?.draftVersion || 0)),
  );

  response.headers.set(
    "X-About-Published-Version",
    String(Number(page?.publishedVersion || 0)),
  );

  return response;
}

export function revalidateAboutAdmin() {
  revalidatePath("/admin/about");
}

export function revalidateAboutPublic() {
  revalidateTag(ABOUT_PAGE_CACHE_TAG, "max");

  revalidatePath("/en/about");
  revalidatePath("/th/about");

  revalidatePath("/en", "layout");
  revalidatePath("/th", "layout");

  revalidateAboutAdmin();
}
