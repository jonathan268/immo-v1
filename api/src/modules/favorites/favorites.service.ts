import { prisma } from "../../utils/prisma";
import { AppError } from "../../middlewares/error.middleware";

export const getFavoritesService = async (userId: string) => {
  const favorites = await prisma.favorite.findMany({
    where: { user_id: userId },
    include: {
      property: {
        include: {
          images: { orderBy: { order: "asc" } },
          owner: {
            select: { id: true, full_name: true, email: true, phone: true },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return favorites.map((f) => f.property);
};

export const addFavoriteService = async (userId: string, propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const existing = await prisma.favorite.findUnique({
    where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
  });

  if (existing) {
    throw new AppError("Property is already in favorites", 409);
  }

  await prisma.favorite.create({
    data: { user_id: userId, property_id: propertyId },
  });
};

export const removeFavoriteService = async (userId: string, propertyId: string) => {
  const existing = await prisma.favorite.findUnique({
    where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
  });

  if (!existing) {
    throw new AppError("Favorite not found", 404);
  }

  await prisma.favorite.delete({
    where: { id: existing.id },
  });
};

export const checkFavoriteService = async (userId: string, propertyId: string) => {
  const existing = await prisma.favorite.findUnique({
    where: { user_id_property_id: { user_id: userId, property_id: propertyId } },
  });

  return { isFavorite: !!existing };
};