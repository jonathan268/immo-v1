import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { env } from "../../config/env";
import { setAuthCookies, clearAuthCookies } from "../../utils/cookies";
import {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
  getMeService,
  forgotPasswordService,
  resetPasswordService,
  generateAuthTokensWithUser,
} from "./auth.service";
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from "./auth.types";
import { User } from "@prisma/client";

export const register = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as RegisterDto;
    const result = await registerService(dto);

    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendSuccess(res, result, "Account created successfully", 201);
  }
);

export const login = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as LoginDto;
    const result = await loginService(dto);

    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendSuccess(res, result, "Login successful");
  }
);

export const refresh = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await refreshTokenService(refreshToken);

    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendSuccess(res, result, "Token refreshed successfully");
  }
);

export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string };
    await logoutService(refreshToken);

    clearAuthCookies(res);
    sendSuccess(res, null, "Logged out successfully");
  }
);

export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await getMeService(req.user!.id);

    sendSuccess(res, user, "Profile fetched successfully");
  }
);

export const forgotPassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as ForgotPasswordDto;
    await forgotPasswordService(dto);

    sendSuccess(res, null, "If this email exists, a reset link has been sent");
  }
);

export const resetPassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as ResetPasswordDto;
    await resetPasswordService(dto);

    sendSuccess(res, null, "Password reset successfully");
  }
);

export const googleCallback = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as User;
    const result = await generateAuthTokensWithUser(user);

    // Utilisation du fragment hash (#) pour éviter que les tokens
    // ne soient loggés par les serveurs intermédiaires ou fuient via Referer
    const redirectUrl = `${env.clientUrl}/auth/google/callback#accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    res.redirect(redirectUrl);
  }
);
