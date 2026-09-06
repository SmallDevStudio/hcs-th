import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/lib/api/errors";

export function apiSuccess({
  data = null,
  message = "Success",
  status = 200,
  meta = null,
} = {}) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    },
    {
      status,
    },
  );
}

export function apiCreated({
  data = null,
  message = "Created successfully",
  meta = null,
} = {}) {
  return apiSuccess({
    data,
    message,
    meta,
    status: 201,
  });
}

export function apiNoContent() {
  return new NextResponse(null, {
    status: 204,
  });
}

export function apiError(error) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        error: {
          code: "VALIDATION_ERROR",
          details: error.flatten(),
        },
      },
      {
        status: 422,
      },
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        error: {
          code: error.code,
          details: error.details,
        },
      },
      {
        status: error.status,
      },
    );
  }

  if (error?.message === "UNAUTHENTICATED") {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required",
        error: {
          code: "UNAUTHENTICATED",
          details: null,
        },
      },
      {
        status: 401,
      },
    );
  }

  console.error("Unhandled API error:", error);

  return NextResponse.json(
    {
      success: false,
      message: "An unexpected error occurred",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        details: null,
      },
    },
    {
      status: 500,
    },
  );
}

export async function withApiHandler(handler) {
  try {
    return await handler();
  } catch (error) {
    return apiError(error);
  }
}
