import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./error.middleware";
import { AuthenticatedRequest, AuthenticatedUser } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../utils/prisma";

export const authenticate = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });

    if (typeof payload === "string" || !payload.id || !payload.role) {
      throw new AppError("Invalid token payload", 401);
    }

    const decoded = payload as AuthenticatedUser;

    // Vérifier que l'utilisateur existe et n'est pas suspendu
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { is_suspended: true },
    });

    if (!user) {
      throw new AppError("User not found", 401);
    }

    if (user.is_suspended) {
      throw new AppError("Your account has been suspended", 403);
    }

    req.user = decoded;

    next();
  }
);