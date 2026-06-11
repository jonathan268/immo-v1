import { Request } from "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
    }
  }
}

export type AuthenticatedUser = Express.User;

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}