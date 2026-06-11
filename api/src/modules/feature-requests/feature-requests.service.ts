import { Prisma, AuditAction } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { sanitizeText, sanitizeOptional } from '../../utils/sanitize';
import { parsePagination } from '../../utils/pagination';
import { createAuditLog } from '../../utils/audit';
import {
  CreateFeatureRequestDto,
  FeatureRequestResponseDto,
  FeatureRequestsListQuery,
  MyFeatureRequestsQuery,
} from './feature-requests.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const featureRequestInclude = {
  requester: {
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
    },
  },
  agent: {
    select: {
      id: true,
      full_name: true,
      email: true,
    },
  },
  property: {
    select: {
      id: true,
      title: true,
      city: true,
    },
  },
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const createFeatureRequestService = async (
  requesterId: string,
  dto: CreateFeatureRequestDto
): Promise<FeatureRequestResponseDto> => {
  // Vérifier que le demandeur a le rôle approprié
  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
  });

  if (!requester) {
    throw new AppError('Requester not found', 404);
  }

  // Un TENANT ne peut pas demander de mise en avant
  if (requester.role === 'TENANT') {
    throw new AppError(
      'Only agents and property owners can request feature',
      403
    );
  }

  // Vérifier l'existence de la cible
  if (dto.target === 'AGENT') {
    const agent = await prisma.user.findUnique({
      where: { id: dto.target_id },
    });

    if (!agent) {
      throw new AppError('Agent not found', 404);
    }

    if (agent.role !== 'OWNER') {
      throw new AppError('Only owners can be featured as agents', 400);
    }

    // M6: Un OWNER ne peut demander que sa propre mise en avant
    if (dto.target_id !== requesterId) {
      throw new AppError('You can only request feature for yourself', 403);
    }

    // Vérifier qu'il n'existe pas déjà une demande PENDING pour cet agent
    const existingRequest = await prisma.featureRequest.findFirst({
      where: {
        agent_id: dto.target_id,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new AppError(
        'A pending feature request already exists for this agent',
        409
      );
    }

    // Créer la demande
    const request = await prisma.featureRequest.create({
      data: {
        requester_id: requesterId,
        target: 'AGENT',
        target_id: dto.target_id,
        agent_id: dto.target_id,
        reason: sanitizeOptional(dto.reason),
      },
      include: featureRequestInclude,
    });

    return mapRequestToResponse(request);
  } else if (dto.target === 'PROPERTY') {
    const property = await prisma.property.findUnique({
      where: { id: dto.target_id, is_deleted: false },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Vérifier que le demandeur est propriétaire de la propriété
    if (property.owner_id !== requesterId) {
      throw new AppError(
        'You can only request feature for your own properties',
        403
      );
    }

    // Vérifier que la propriété est approuvée
    if (property.status !== 'APPROVED') {
      throw new AppError('Only approved properties can be featured', 400);
    }

    // Vérifier qu'il n'existe pas déjà une demande PENDING pour cette propriété
    const existingRequest = await prisma.featureRequest.findFirst({
      where: {
        property_id: dto.target_id,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new AppError(
        'A pending feature request already exists for this property',
        409
      );
    }

    // Créer la demande
    const request = await prisma.featureRequest.create({
      data: {
        requester_id: requesterId,
        target: 'PROPERTY',
        target_id: dto.target_id,
        property_id: dto.target_id,
        reason: sanitizeOptional(dto.reason),
      },
      include: featureRequestInclude,
    });

    return mapRequestToResponse(request);
  } else {
    throw new AppError('Invalid target', 400);
  }
};

export const getMyFeatureRequestsService = async (
  userId: string,
  query: MyFeatureRequestsQuery
): Promise<{
  requests: FeatureRequestResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.FeatureRequestWhereInput = {
    requester_id: userId,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.target) {
    where.target = query.target;
  }

  const [total, requests] = await Promise.all([
    prisma.featureRequest.count({ where }),
    prisma.featureRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: featureRequestInclude,
    }),
  ]);

  return {
    requests: requests.map(mapRequestToResponse),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPendingFeatureRequestsService = async (
  query: FeatureRequestsListQuery
): Promise<{
  requests: FeatureRequestResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.FeatureRequestWhereInput = {
    status: 'PENDING',
  };

  if (query.target) {
    where.target = query.target;
  }

  const [total, requests] = await Promise.all([
    prisma.featureRequest.count({ where }),
    prisma.featureRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'asc' },
      include: featureRequestInclude,
    }),
  ]);

  return {
    requests: requests.map(mapRequestToResponse),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getFeatureRequestService = async (
  requestId: string
): Promise<FeatureRequestResponseDto> => {
  const request = await prisma.featureRequest.findUnique({
    where: { id: requestId },
    include: featureRequestInclude,
  });

  if (!request) {
    throw new AppError('Feature request not found', 404);
  }

  return mapRequestToResponse(request);
};

export const approveFeatureRequestService = async (
  requestId: string,
  adminId: string
): Promise<FeatureRequestResponseDto> => {
  const request = await prisma.featureRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError('Feature request not found', 404);
  }

  if (request.status !== 'PENDING') {
    throw new AppError(
      `Request is already ${request.status.toLowerCase()}`,
      409
    );
  }

  // Mise à jour atomique : on vérifie que le statut est encore PENDING
  const updatedRequest = await prisma.$transaction(async (tx) => {
    const updated = await tx.featureRequest.update({
      where: { id: requestId, status: 'PENDING' },
      data: {
        status: 'APPROVED',
        reviewed_by: adminId,
        reviewed_at: new Date(),
      },
      include: featureRequestInclude,
    });

    if (request.target === 'AGENT' && request.agent_id) {
      await tx.user.update({
        where: { id: request.agent_id },
        data: { is_featured: true },
      });
    } else if (request.target === 'PROPERTY' && request.property_id) {
      await tx.property.update({
        where: { id: request.property_id },
        data: { is_featured: true },
      });
    }

    return updated;
  });

  await createAuditLog({
    userId: adminId,
    action: AuditAction.FEATURE_REQUEST_APPROVED,
    targetId: requestId,
    targetType: "FEATURE_REQUEST",
    details: `Target: ${request.target}, ID: ${request.target_id}`,
  });

  return mapRequestToResponse(updatedRequest);
};

export const rejectFeatureRequestService = async (
  requestId: string,
  adminId: string,
  rejectionReason?: string
): Promise<FeatureRequestResponseDto> => {
  const request = await prisma.featureRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError('Feature request not found', 404);
  }

  if (request.status !== 'PENDING') {
    throw new AppError(
      `Request is already ${request.status.toLowerCase()}`,
      409
    );
  }

  // Mise à jour atomique avec vérification du statut
  const updatedRequest = await prisma.featureRequest.update({
    where: { id: requestId, status: 'PENDING' },
    data: {
      status: 'REJECTED',
      reviewed_by: adminId,
      reviewed_at: new Date(),
      rejection_reason: sanitizeOptional(rejectionReason),
    },
    include: featureRequestInclude,
  });

  await createAuditLog({
    userId: adminId,
    action: AuditAction.FEATURE_REQUEST_REJECTED,
    targetId: requestId,
    targetType: "FEATURE_REQUEST",
    details: `Target: ${request.target}, ID: ${request.target_id}`,
  });

  return mapRequestToResponse(updatedRequest);
};

// ─── Helper Functions ──────────────────────────────────────────────────────────

function mapRequestToResponse(request: any): FeatureRequestResponseDto {
  return {
    id: request.id,
    requester_id: request.requester_id,
    target: request.target,
    target_id: request.target_id,
    status: request.status,
    reason: request.reason,
    created_at: request.created_at,
    updated_at: request.updated_at,
    reviewed_by: request.reviewed_by,
    reviewed_at: request.reviewed_at,
    rejection_reason: request.rejection_reason,
    requester: request.requester,
    agent: request.agent,
    property: request.property,
  };
}
