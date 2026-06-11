import { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { env } from "../config/env";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // AppError — erreurs métier volontaires
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma — erreurs connues
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "A record with this value already exists.",
      });
      return;
    }

    if (err.code === "P2023") {
      res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found.",
      });
      return;
    }

    if (err.code === "P2003") {
      res.status(400).json({
        success: false,
        message: "Referenced record does not exist.",
      });
      return;
    }
  }

  // Erreur inconnue
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({
    success: false,
    message:
      env.nodeEnv === "production"
        ? "Internal Server Error"
        : err.message,
  });
};