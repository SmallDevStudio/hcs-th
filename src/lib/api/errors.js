export class ApiError extends Error {
  constructor(
    message,
    {
      status = 500,
      code = "INTERNAL_SERVER_ERROR",
      details = null,
      cause = null,
    } = {},
  ) {
    super(message, {
      cause,
    });

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Validation failed", details = null) {
    super(message, {
      status: 422,
      code: "VALIDATION_ERROR",
      details,
    });

    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = "Authentication required") {
    super(message, {
      status: 401,
      code: "UNAUTHENTICATED",
    });

    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, {
      status: 403,
      code: "FORBIDDEN",
    });

    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, {
      status: 404,
      code: "NOT_FOUND",
    });

    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Resource already exists", details = null) {
    super(message, {
      status: 409,
      code: "CONFLICT",
      details,
    });

    this.name = "ConflictError";
  }
}

export class InvalidRequestError extends ApiError {
  constructor(message = "Invalid request body", details = null) {
    super(message, {
      status: 400,
      code: "INVALID_REQUEST",
      details,
    });

    this.name = "InvalidRequestError";
  }
}
