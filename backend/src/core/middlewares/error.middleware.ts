import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { Prisma } from "../../generated/prisma/client.js";
import ApiError from "../../shared/utils/ApiError.js";

type ErrorDetail = {
  path?: string;
  message: string;
};

const getPrismaErrorDetails = (
  error: Prisma.PrismaClientKnownRequestError,
): {
  statusCode: number;
  message: string;
  errors: ErrorDetail[];
} => {
  switch (error.code) {
    case "P2002": {
      const target = error.meta?.target;
      const fields = Array.isArray(target)
        ? target.map(String)
        : typeof target === "string"
          ? [target]
          : [];

      return {
        statusCode: 409,
        message: "A record with the provided value already exists.",
        errors: fields.map((field) => ({
          path: field,
          message: `${field} already exists.`,
        })),
      };
    }

    case "P2025":
      return {
        statusCode: 404,
        message: "The requested resource was not found.",
        errors: [],
      };

    case "P2003":
      return {
        statusCode: 409,
        message: "Related resource constraint failed.",
        errors: [],
      };

    case "P2014":
      return {
        statusCode: 409,
        message: "Required relationship constraint failed.",
        errors: [],
      };

    default:
      return {
        statusCode: 500,
        message: "Database operation failed.",
        errors: [],
      };
  }
};

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (res.headersSent) {
    _next(error);
    return;
  }

  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const stack = error instanceof Error ? error.stack : undefined;
  const isDev = env.NODE_ENV === "development";

  let statusCode = 500;
  let message = isDev ? errorMessage : "Internal Server Error";
  let errors: ErrorDetail[] = [];
  let isOperational = false;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors as ErrorDetail[];
    isOperational = true;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = error.issues.map((issue) => ({
      path: issue.path.join(".") || "root",
      message: issue.message,
    }));
    isOperational = true;
  } else if (
    error instanceof SyntaxError &&
    "status" in error &&
    (error as { status: unknown }).status === 400 &&
    "body" in error
  ) {
    statusCode = 400;
    message = "Invalid JSON payload in request body.";
    isOperational = true;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const result = getPrismaErrorDetails(error);
    statusCode = result.statusCode;
    message = result.message;
    errors = result.errors;
    isOperational =
      error.code === "P2002" ||
      error.code === "P2025" ||
      error.code === "P2003" ||
      error.code === "P2014";
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = isDev ? error.message : "Invalid database operation.";
    isOperational = true;
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = "Database service is temporarily unavailable.";
    isOperational = false;
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    message = "Database service encountered an internal error.";
    isOperational = false;
  } else {
    statusCode = 500;
    message = isDev ? errorMessage : "Internal Server Error";
    isOperational = false;
  }

  const responseStatusCode = statusCode;
  const responseMessage =
    !isDev && !isOperational && statusCode === 500
      ? "Internal Server Error"
      : message;

  const logMeta = {
    statusCode: responseStatusCode,
    method: req.method,
    route: req.originalUrl,
    errorName: error instanceof Error ? error.name : "UnknownError",
  };

  if (isOperational) {
    logger.warn(`Operational error: ${message}`, {
      ...logMeta,
      errors,
    });
  } else {
    logger.error(`Unhandled error: ${errorMessage}`, {
      ...logMeta,
      stack,
      error,
    });
  }

  res.status(responseStatusCode).json({
    success: false,
    message: responseMessage,
    ...(errors.length > 0 ? { errors } : {}),
  });
};