import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AppError } from "./error.middleware";
import { AuthenticatedRequest } from "../types";

export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    if (!roles.includes(req.user.role as Role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }

    next();
  };
};