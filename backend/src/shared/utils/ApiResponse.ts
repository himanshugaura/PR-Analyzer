import type { Response } from "express";

const sendResponse = <T = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  payload?: T,
): void => {
  const isPlainObject =
    payload !== null &&
    typeof payload === "object" &&
    !Array.isArray(payload);

  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    ...(isPlainObject ? (payload as Record<string, unknown>) : payload !== undefined ? { data: payload } : {}),
  });
};

export default sendResponse;
