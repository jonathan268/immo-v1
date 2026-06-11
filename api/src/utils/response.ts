import { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = "Success",
  statusCode = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message = "Internal Server Error",
  statusCode = 500,
  errors: unknown = null
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const sendPaginated = (
  res: Response,
  data: unknown,
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  },
  message = "Success"
): void => {
  res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};