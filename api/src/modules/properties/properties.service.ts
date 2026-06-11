import { Prisma, PropertyStatus, PropertyType, AuditAction } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../middlewares/error.middleware";
import { sanitizeText } from "../../utils/sanitize";
import { parsePagination } from "../../utils/pagination";
import { createAuditLog } from "../../utils/audit";
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  UpdatePropertyStatusDto,
  PropertiesListQuery,
} from "./properties.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const propertyInclude = {
  images: {
    orderBy: { order: "asc" as const },
  },
  owner: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
    },
  },
};

const buildOrderBy = (
  sort?: string
): Prisma.PropertyOrderByWithRelationInput[] => {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }];
    case "price_desc":
      return [{ price: "desc" }];
    case "newest":
    default:
      return [{ created_at: "desc" }];
  }
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const createPropertyService = async (
  ownerId: string,
  dto: CreatePropertyDto
) => {
  const property = await prisma.property.create({
    data: {
      owner_id: ownerId,
      title: sanitizeText(dto.title),
      description: sanitizeText(dto.description),
      country: sanitizeText(dto.country),
      city: sanitizeText(dto.city),
      neighborhood: sanitizeText(dto.neighborhood),
      address: sanitizeText(dto.address),
      property_type: dto.property_type,
      price: dto.price,
      currency: dto.currency ?? "XOF",
      size_m2: dto.size_m2,
      status: "PENDING",
    },
    include: propertyInclude,
  });

  return property;
};

export const listPropertiesService = async (query: PropertiesListQuery) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  // Construire les filtres
  const where: Prisma.PropertyWhereInput = {
    is_deleted: false,
    status: "APPROVED",
  };

  if (query.city) {
    where.city = { contains: query.city, mode: "insensitive" };
  }

  if (query.neighborhood) {
    where.neighborhood = { contains: query.neighborhood, mode: "insensitive" };
  }

  if (query.property_type) {
    where.property_type = query.property_type as PropertyType;
  }

  if (query.price_min || query.price_max) {
    const priceFilter: Prisma.FloatFilter = {};
    if (query.price_min) {
      priceFilter.gte = parseFloat(query.price_min);
    }
    if (query.price_max) {
      priceFilter.lte = parseFloat(query.price_max);
    }
    where.price = priceFilter;
  }

  if (query.size_min || query.size_max) {
    const sizeFilter: Prisma.FloatFilter = {};
    if (query.size_min) {
      sizeFilter.gte = parseFloat(query.size_min);
    }
    if (query.size_max) {
      sizeFilter.lte = parseFloat(query.size_max);
    }
    where.size_m2 = sizeFilter;
  }

  // Featured en haut, puis tri demandé
  const orderBy: Prisma.PropertyOrderByWithRelationInput[] = [
    { is_featured: "desc" },
    ...buildOrderBy(query.sort),
  ];

  const [total, properties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: propertyInclude,
    }),
  ]);

  return {
    properties,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPropertyService = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false, status: "APPROVED" },
    include: propertyInclude,
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  return property;
};

export const updatePropertyService = async (
  propertyId: string,
  ownerId: string,
  dto: UpdatePropertyDto
) => {
  // Vérifier que la propriété existe et appartient à l'owner
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.owner_id !== ownerId) {
    throw new AppError("You are not allowed to update this property", 403);
  }

  // Construire dynamiquement les champs à modifier
  const dataToUpdate: Prisma.PropertyUpdateInput = {};
  if (dto.title !== undefined) dataToUpdate.title = sanitizeText(dto.title);
  if (dto.description !== undefined) dataToUpdate.description = sanitizeText(dto.description);
  if (dto.country !== undefined) dataToUpdate.country = sanitizeText(dto.country);
  if (dto.city !== undefined) dataToUpdate.city = sanitizeText(dto.city);
  if (dto.neighborhood !== undefined) dataToUpdate.neighborhood = sanitizeText(dto.neighborhood);
  if (dto.address !== undefined) dataToUpdate.address = sanitizeText(dto.address);
  if (dto.property_type !== undefined) dataToUpdate.property_type = dto.property_type;
  if (dto.price !== undefined) dataToUpdate.price = dto.price;
  if (dto.currency !== undefined) dataToUpdate.currency = dto.currency;
  if (dto.size_m2 !== undefined) dataToUpdate.size_m2 = dto.size_m2;

  if (Object.keys(dataToUpdate).length === 0) {
    throw new AppError("No fields to update", 400);
  }

  // Toute modification repasse en PENDING
  dataToUpdate.status = "PENDING";

  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data: dataToUpdate,
    include: propertyInclude,
  });

  return updatedProperty;
};

export const deletePropertyService = async (
  propertyId: string,
  ownerId: string
): Promise<void> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.owner_id !== ownerId) {
    throw new AppError("You are not allowed to delete this property", 403);
  }

  // Soft delete
  await prisma.property.update({
    where: { id: propertyId },
    data: { is_deleted: true },
  });
};

export const getMyPropertiesService = async (
  ownerId: string,
  query: PropertiesListQuery
) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.PropertyWhereInput = {
    owner_id: ownerId,
    is_deleted: false,
  };

  const [total, properties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: propertyInclude,
    }),
  ]);

  return {
    properties,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updatePropertyStatusService = async (
  propertyId: string,
  dto: UpdatePropertyStatusDto
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.status === dto.status) {
    throw new AppError(`Property is already ${dto.status.toLowerCase()}`, 409);
  }

  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data: { status: dto.status as PropertyStatus },
    include: propertyInclude,
  });

  await createAuditLog({
    action: dto.status === "APPROVED" ? AuditAction.PROPERTY_APPROVED : AuditAction.PROPERTY_REJECTED,
    targetId: propertyId,
    targetType: "PROPERTY",
    details: `Status changed from ${property.status} to ${dto.status}`,
  });

  return updatedProperty;
};

export const featurePropertyService = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.status !== "APPROVED") {
    throw new AppError("Only approved properties can be featured", 400);
  }

  if (property.is_featured) {
    throw new AppError("Property is already featured", 409);
  }

  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data: { is_featured: true },
    include: propertyInclude,
  });

  await createAuditLog({
    action: AuditAction.PROPERTY_FEATURED,
    targetId: propertyId,
    targetType: "PROPERTY",
  });

  return updatedProperty;
};

export const listPendingPropertiesService = async (query: PropertiesListQuery) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.PropertyWhereInput = {
    is_deleted: false,
    status: "PENDING",
  };

  if (query.city) {
    where.city = { contains: query.city, mode: "insensitive" };
  }

  if (query.property_type) {
    where.property_type = query.property_type as PropertyType;
  }

  const [total, properties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: propertyInclude,
    }),
  ]);

  return {
    properties,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};