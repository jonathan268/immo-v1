import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../middlewares/error.middleware";
import { env } from "../../config/env";
import { createAuditLog } from "../../utils/audit";
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  TokenPayload,
  AuthTokens,
  AuthTokensWithUser,
} from "./auth.types";
import { User, AuditAction, Prisma } from "@prisma/client";
import { Profile } from "passport-google-oauth20";
import { sanitizeText } from "../../utils/sanitize";
import { sendPasswordResetEmail } from "../../utils/mail";

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_EXPIRES_IN_MS = 60 * 60 * 1000;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

const excludePassword = (user: User): Omit<User, "password"> => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const generateAuthTokens = async (user: User): Promise<AuthTokens> => {
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
    },
  });

  return { accessToken, refreshToken };
};

const generateAuthTokensWithUser = async (user: User): Promise<AuthTokensWithUser> => {
  const tokens = await generateAuthTokens(user);
  return { ...tokens, user: excludePassword(user) };
};

export { generateAuthTokens, generateAuthTokensWithUser };

export const googleAuthService = async (profile: Profile): Promise<User> => {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new AppError("Google account must have an email", 400);
  }

  let user = await prisma.user.findUnique({
    where: { google_id: profile.id },
  });

  if (user) {
    return user;
  }

  user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { google_id: profile.id },
    });
    return user;
  }

  const fullName = sanitizeText(
    profile.displayName ||
    `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim()
  );

  user = await prisma.user.create({
    data: {
      full_name: fullName,
      email,
      google_id: profile.id,
      is_verified: true,
    },
  });

  return user;
};

export const registerService = async (dto: RegisterDto): Promise<AuthTokensWithUser> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  if (dto.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingPhone) {
      throw new AppError("Phone number already in use", 409);
    }
  }

  const allowedRoles = ["OWNER", "TENANT"];
  const role = dto.role ?? "TENANT";
  if (!allowedRoles.includes(role)) {
    throw new AppError("Role must be OWNER or TENANT", 400);
  }

  const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      full_name: sanitizeText(dto.full_name),
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      role,
    },
  });

  return generateAuthTokensWithUser(user);
};

const FAKE_HASH = "$2a$12$0000000000000000000000000000000000000000000000000000000000";

export const loginService = async (dto: LoginDto): Promise<AuthTokensWithUser> => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  const passwordHash = user?.password ?? FAKE_HASH;

  // Toujours exécuter bcrypt.compare même si l'utilisateur n'existe pas,
  // pour éviter l'énumération par timing
  const isPasswordValid = await bcrypt.compare(dto.password, passwordHash);

  if (!user || !user.password) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.is_suspended) {
    throw new AppError("Your account has been suspended", 403);
  }

  // Vérifier si le compte est verrouillé
  if (user.locked_until && user.locked_until > new Date()) {
    throw new AppError(
      "Account temporarily locked due to too many failed attempts. Please try again later.",
      429
    );
  }

  // Vérifier si l'email a été vérifié
  if (!user.is_verified && user.password) {
    throw new AppError(
      "Please verify your email address before logging in",
      403
    );
  }

  if (!isPasswordValid) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { failed_login_attempts: { increment: 1 } },
      select: { failed_login_attempts: true },
    });

    if (updatedUser.failed_login_attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      await prisma.user.update({
        where: { id: user.id },
        data: { locked_until: new Date(Date.now() + LOCKOUT_DURATION_MS) },
      });
    }

    throw new AppError("Invalid email or password", 401);
  }

  // Réinitialiser le compteur d'échecs en cas de succès
  if (user.failed_login_attempts > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failed_login_attempts: 0,
        locked_until: null,
      },
    });
  }

  return generateAuthTokensWithUser(user);
};

export const refreshTokenService = async (
  token: string
): Promise<AuthTokensWithUser> => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (storedToken.expires_at < new Date()) {
    await prisma.refreshToken.delete({ where: { token } });
    throw new AppError("Refresh token expired, please login again", 401);
  }

  if (storedToken.user.is_suspended) {
    throw new AppError("Your account has been suspended", 403);
  }

  // Atomic token reuse detection : updateMany permet de n'utiliser le token que s'il ne l'a pas déjà été
  const result = await prisma.refreshToken.updateMany({
    where: { token, used: false },
    data: { used: true },
  });

  if (result.count === 0) {
    await prisma.refreshToken.deleteMany({
      where: { user_id: storedToken.user_id },
    });
    throw new AppError(
      "Refresh token reuse detected. All sessions have been invalidated for security.",
      401
    );
  }

  return generateAuthTokensWithUser(storedToken.user);
};

export const logoutService = async (token: string): Promise<void> => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  await prisma.refreshToken.update({
    where: { token },
    data: { used: true },
  });
};

export const getMeService = async (
  userId: string
): Promise<Omit<User, "password">> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const forgotPasswordService = async (dto: ForgotPasswordDto): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user || !user.password) {
    // Dummy bcrypt pour éviter l'énumération par timing
    await bcrypt.compare(dto.email, FAKE_HASH);
    return;
  }

  const resetToken = generateResetToken();
  const hashedToken = await bcrypt.hash(resetToken, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      reset_token: hashedToken,
      reset_token_expires: new Date(Date.now() + RESET_TOKEN_EXPIRES_IN_MS),
    },
  });

  const resetUrl = `${env.clientUrl}/reset-password#token=${resetToken}`;

  await sendPasswordResetEmail(user.email, resetUrl);
};

export const resetPasswordService = async (dto: ResetPasswordDto): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user || !user.reset_token || !user.reset_token_expires) {
    // Dummy bcrypt pour éviter l'énumération par timing
    await bcrypt.compare(dto.token, FAKE_HASH);
    throw new AppError("Invalid or expired reset token", 400);
  }

  if (user.reset_token_expires < new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { reset_token: null, reset_token_expires: null },
    });
    throw new AppError("Reset token has expired", 400);
  }

  const isTokenValid = await bcrypt.compare(dto.token, user.reset_token);

  if (!isTokenValid) {
    throw new AppError("Invalid reset token", 400);
  }

  const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    },
  });
};
