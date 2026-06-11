import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../middlewares/error.middleware";
import { sanitizeText } from "../../utils/sanitize";
import { parsePagination } from "../../utils/pagination";
import {
  CreateInquiryDto,
  InquiriesListQuery,
} from "./inquiries.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inquiryInclude = {
  property: {
    select: {
      id: true,
      title: true,
      city: true,
      neighborhood: true,
      owner_id: true,
    },
  },
  sender: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
    },
  },
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const createInquiryService = async (
  propertyId: string,
  dto: CreateInquiryDto,
  senderId?: string
) => {
  // Vérifier que la propriété existe et est approuvée
  const property = await prisma.property.findUnique({
    where: { id: propertyId, is_deleted: false },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.status !== "APPROVED") {
    throw new AppError("You can only contact owners of approved properties", 400);
  }

  // Un owner ne peut pas envoyer une demande sur sa propre annonce
  if (senderId && property.owner_id === senderId) {
    throw new AppError("You cannot send an inquiry on your own property", 403);
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      property_id: propertyId,
      sender_id: senderId ?? null,
      name: sanitizeText(dto.name),
      phone_number: sanitizeText(dto.phone_number),
      message: sanitizeText(dto.message),
    },
    include: inquiryInclude,
  });

  return inquiry;
};

export const getMyInquiriesService = async (
  ownerId: string,
  query: InquiriesListQuery
) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  // Récupérer uniquement les demandes sur les annonces de l'owner
  const where: Prisma.InquiryWhereInput = {
    property: {
      owner_id: ownerId,
      is_deleted: false,
    },
  };

  if (query.property_id) {
    where.property_id = query.property_id;
  }

  const [total, inquiries] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: inquiryInclude,
    }),
  ]);

  return {
    inquiries,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getInquiryService = async (
  inquiryId: string,
  requesterId: string,
  requesterRole: string
) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    include: inquiryInclude,
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found", 404);
  }

  // Un owner ne peut voir que les demandes sur ses propres annonces
  if (
    requesterRole === "OWNER" &&
    inquiry.property.owner_id !== requesterId
  ) {
    throw new AppError("You are not allowed to view this inquiry", 403);
  }

  return inquiry;
};

export const listInquiriesService = async (query: InquiriesListQuery) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.InquiryWhereInput = {};

  if (query.property_id) {
    where.property_id = query.property_id;
  }

  const [total, inquiries] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: inquiryInclude,
    }),
  ]);

  return {
    inquiries,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const deleteInquiryService = async (
  inquiryId: string
): Promise<void> => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found", 404);
  }

  await prisma.inquiry.delete({
    where: { id: inquiryId },
  });
};