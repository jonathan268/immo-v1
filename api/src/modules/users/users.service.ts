import { Prisma, AuditAction, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../middlewares/error.middleware";
import { sanitizeText, sanitizeOptional } from "../../utils/sanitize";
import { parsePagination } from "../../utils/pagination";
import { createAuditLog } from "../../utils/audit";
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UserResponseDto,
  UsersListQuery,
} from "./users.types";

const SALT_ROUNDS = 12;

const PUBLIC_USER_FIELDS = {
  id: true,
  full_name: true,
  email: true,
  phone: true,
  role: true,
  is_verified: true,
  is_suspended: true,
  is_featured: true,
  created_at: true,
  updated_at: true,
} as const;

type PublicUser = Pick<Prisma.UserGetPayload<{}>, keyof typeof PUBLIC_USER_FIELDS>;

const mapUserToResponse = (user: PublicUser): UserResponseDto => {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_verified: user.is_verified,
    is_suspended: user.is_suspended,
    is_featured: user.is_featured,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

// ─────────────────────────────────────────────────────────────────────────────

export const getProfileService = async (
  userId: string
): Promise<UserResponseDto> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_FIELDS,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return mapUserToResponse(user);
};

export const updateProfileService = async (
  userId: string,
  dto: UpdateProfileDto
): Promise<UserResponseDto> => {
  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_FIELDS,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Si le téléphone est modifié, vérifier son unicité
  if (dto.phone && dto.phone !== user.phone) {
    const phoneExists = await prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (phoneExists) {
      throw new AppError("Phone number already in use", 409);
    }
  }

  // Mettre à jour le profil
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      full_name: sanitizeOptional(dto.full_name) ?? user.full_name,
      phone: dto.phone ?? user.phone,
    },
    select: PUBLIC_USER_FIELDS,
  });

  await createAuditLog({
    action: AuditAction.PROFILE_UPDATED,
    targetId: userId,
    targetType: "USER",
  });

  return mapUserToResponse(updatedUser);
};

export const changePasswordService = async (
  userId: string,
  dto: ChangePasswordDto
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.password) {
    throw new AppError("This account uses Google authentication. Password changes are not available.", 400);
  }

  // Vérifier le mot de passe courant
  const isCurrentPasswordValid = await bcrypt.compare(
    dto.current_password,
    user.password
  );

  if (!isCurrentPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  // Vérifier que le nouveau mot de passe est différent
  if (dto.current_password === dto.new_password) {
    throw new AppError(
      "New password must be different from current password",
      400
    );
  }

  // Hasher et mettre à jour
  const hashedPassword = await bcrypt.hash(dto.new_password, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    }),
    // Invalider toutes les sessions existantes
    prisma.refreshToken.deleteMany({
      where: { user_id: userId },
    }),
  ]);

  await createAuditLog({
    userId,
    action: AuditAction.PASSWORD_CHANGED,
    targetId: userId,
    targetType: "USER",
  });
};

export const listUsersService = async (
  query: UsersListQuery
): Promise<{
  users: UserResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.UserWhereInput = {};

  if (query.role) {
    where.role = query.role as Role;
  }

  if (query.is_suspended === "true") {
    where.is_suspended = true;
  } else if (query.is_suspended === "false") {
    where.is_suspended = false;
  }

  // Compter total et récupérer les utilisateurs
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      select: PUBLIC_USER_FIELDS,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users: users.map(mapUserToResponse),
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

export const getUserService = async (userId: string): Promise<UserResponseDto> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_FIELDS,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return mapUserToResponse(user);
};

export const suspendUserService = async (userId: string, actorId: string): Promise<UserResponseDto> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_FIELDS,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { is_suspended: true },
    select: PUBLIC_USER_FIELDS,
  });

  await createAuditLog({
    userId: actorId,
    action: AuditAction.USER_SUSPENDED,
    targetId: userId,
    targetType: "USER",
  });

  return mapUserToResponse(updatedUser);
};

export const unsuspendUserService = async (userId: string, actorId: string): Promise<UserResponseDto> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_FIELDS,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.is_suspended) {
    throw new AppError("User is not suspended", 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { is_suspended: false },
    select: PUBLIC_USER_FIELDS,
  });

  await createAuditLog({
    userId: actorId,
    action: AuditAction.USER_SUSPENDED,
    targetId: userId,
    targetType: "USER",
    details: "Unsuspended",
  });

  return mapUserToResponse(updatedUser);
};

export const featureUserService = async (userId: string, actorId: string): Promise<UserResponseDto> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_FIELDS,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { is_featured: !user.is_featured },
    select: PUBLIC_USER_FIELDS,
  });

  await createAuditLog({
    userId: actorId,
    action: AuditAction.USER_FEATURED,
    targetId: userId,
    targetType: "USER",
    details: `is_featured set to ${!user.is_featured}`,
  });

  return mapUserToResponse(updatedUser);
};

export const deleteUserService = async (userId: string, actorId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, is_suspended: true, email: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.is_suspended && user.email.startsWith("deleted_")) {
    throw new AppError("User is already deleted", 400);
  }

  // Soft delete — marquer l'utilisateur comme suspendu
  // Et nettoyer ses données sensibles + invalider ses sessions
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        is_suspended: true,
        email: `deleted_${userId}@deleted.local`,
        phone: `deleted_${userId}`,
      },
    }),
    prisma.refreshToken.deleteMany({
      where: { user_id: userId },
    }),
  ]);

  await createAuditLog({
    userId: actorId,
    action: AuditAction.USER_DELETED,
    targetId: userId,
    targetType: "USER",
  });
};