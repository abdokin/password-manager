import { NextResponse } from "next/server";

import { logger } from "./logger";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export function handleError(error: unknown): NextResponse {
  // Log the error
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(error.message, error, { code: error.code });
    } else {
      logger.warn(error.message, { code: error.code, statusCode: error.statusCode });
    }
  } else if (error instanceof Error) {
    logger.error("Unhandled error", error);
  } else {
    logger.error("Unknown error", new Error(String(error)));
  }

  // Return appropriate response
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.fields ? { fields: error.fields } : {}),
      },
      { status: error.statusCode }
    );
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === "development";
  return NextResponse.json(
    {
      error: isDevelopment
        ? error instanceof Error
          ? error.message
          : "An unexpected error occurred"
        : "An unexpected error occurred",
      ...(isDevelopment && error instanceof Error ? { stack: error.stack } : {}),
    },
    { status: 500 }
  );
}
