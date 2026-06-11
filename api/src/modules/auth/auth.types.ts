import { User } from "@prisma/client";

export interface RegisterDto {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  role?: "OWNER" | "TENANT";
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  email: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokensWithUser extends AuthTokens {
  user: Omit<User, "password">;
}