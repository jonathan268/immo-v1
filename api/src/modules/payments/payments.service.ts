import { Prisma, PaymentStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../middlewares/error.middleware";
import { env } from "../../config/env";
import {
  initiateFlutterwavePayment,
  verifyFlutterwaveTransaction,
} from "../../config/flutterwave";
import crypto from "node:crypto";
import { parsePagination } from "../../utils/pagination";
import {
  InitiatePaymentDto,
  FlutterwaveWebhookDto,
  PaymentsListQuery,
} from "./payments.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const AGENT_FEATURE_PRICE = 5000;
const PROPERTY_FEATURE_PRICE = 3000;

const PRICES: Record<string, number> = {
  AGENT_FEATURE: AGENT_FEATURE_PRICE,
  FEATURED: PROPERTY_FEATURE_PRICE,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const paymentInclude = {
  owner: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
    },
  },
  property: {
    select: {
      id: true,
      title: true,
      city: true,
      neighborhood: true,
      status: true,
      is_featured: true,
    },
  },
} as const;

// Générer une référence de transaction unique
const generateTxRef = (): string => {
  return `IMMO-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const initiatePaymentService = async (
  ownerId: string,
  dto: InitiatePaymentDto
) => {
  const paymentType = dto.type ?? "FEATURED";
  const txRef = generateTxRef();

  const expectedPrice = PRICES[paymentType];
  if (Math.round(dto.amount) !== expectedPrice) {
    throw new AppError(`Invalid amount: expected ${expectedPrice} ${dto.currency ?? "XOF"}`, 400);
  }

  if (paymentType === "AGENT_FEATURE") {
    // Vérifier que l'owner existe
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new AppError("User not found", 404);
    }

    if (owner.role !== "OWNER") {
      throw new AppError("Only owners can be featured as agents", 400);
    }

    if (owner.is_featured) {
      throw new AppError("Agent is already featured", 409);
    }

    const payment = await prisma.$transaction(async (tx) => {
      const pendingPayment = await tx.payment.findFirst({
        where: {
          owner_id: ownerId,
          status: "PENDING",
          type: "AGENT_FEATURE",
        },
      });

      if (pendingPayment) {
        throw new AppError("A payment is already pending for this agent feature", 409);
      }

      return tx.payment.create({
        data: {
          owner_id: ownerId,
          amount: dto.amount,
          currency: dto.currency ?? "XOF",
          status: "PENDING",
          type: "AGENT_FEATURE",
          flutterwave_ref: txRef,
        },
        include: paymentInclude,
      });
    });

    const { payment_link } = await initiateFlutterwavePayment({
      tx_ref: txRef,
      amount: dto.amount,
      currency: dto.currency ?? "XOF",
      payment_options: "mobilemoney",
      customer: {
        email: owner.email,
        phonenumber: dto.phone_number,
        name: owner.full_name,
      },
      meta: {
        owner_id: ownerId,
        payment_db_id: payment.id,
      },
      customizations: {
        title: "Mise en avant d'agent",
        description: `Mise en avant de : ${owner.full_name}`,
      },
    });

    return { payment, payment_link };
  }

  // FEATURED — mise en avant de propriété
  const property = await prisma.property.findUnique({
    where: { id: dto.property_id, is_deleted: false },
    include: {
      owner: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.owner_id !== ownerId) {
    throw new AppError(
      "You are not allowed to make a payment for this property",
      403
    );
  }

  if (property.status !== "APPROVED") {
    throw new AppError(
      "Only approved properties can be featured",
      400
    );
  }

  if (property.is_featured) {
    throw new AppError("Property is already featured", 409);
  }

  const payment = await prisma.$transaction(async (tx) => {
    const pendingPayment = await tx.payment.findFirst({
      where: {
        property_id: dto.property_id,
        owner_id: ownerId,
        status: "PENDING",
      },
    });

    if (pendingPayment) {
      throw new AppError(
        "A payment is already pending for this property",
        409
      );
    }

    return tx.payment.create({
      data: {
        owner_id: ownerId,
        property_id: dto.property_id,
        amount: dto.amount,
        currency: dto.currency ?? "XOF",
        status: "PENDING",
        type: "FEATURED",
        flutterwave_ref: txRef,
      },
      include: paymentInclude,
    });
  });

  const { payment_link } = await initiateFlutterwavePayment({
    tx_ref: txRef,
    amount: dto.amount,
    currency: dto.currency ?? "XOF",
    payment_options: "mobilemoney",
    customer: {
      email: property.owner.email,
      phonenumber: dto.phone_number,
      name: property.owner.full_name,
    },
    meta: {
      property_id: dto.property_id,
      owner_id: ownerId,
      payment_db_id: payment.id,
    },
    customizations: {
      title: "Mise en avant de propriété",
      description: `Mise en avant de : ${property.title}`,
    },
  });

  return {
    payment,
    payment_link,
  };
};

export const handleWebhookService = async (
  payload: FlutterwaveWebhookDto,
  signature: string
): Promise<void> => {
  // Vérifier la signature du webhook (timing-safe comparison)
  const sigBuffer = Buffer.from(signature);
  const secretBuffer = Buffer.from(env.flutterwave.secretHash);
  if (sigBuffer.length !== secretBuffer.length || !crypto.timingSafeEqual(sigBuffer, secretBuffer)) {
    throw new AppError("Invalid webhook signature", 401);
  }

  if (payload.event !== "charge.completed") {
    return; // Ignorer les autres événements
  }

  const { tx_ref, status } = payload.data;

  if (status !== "successful") {
    return; // Ignorer les événements non réussis
  }

  // Vérifier la transaction côté Flutterwave
  const verified = await verifyFlutterwaveTransaction(
    String(payload.data.id)
  );

  if (verified.status !== "successful") {
    return;
  }

  // Trouver le paiement correspondant
  const payment = await prisma.payment.findUnique({
    where: { flutterwave_ref: tx_ref },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  // Vérifier le montant retourné par Flutterwave
  const verifiedAmount = Number(verified.amount);
  const paymentAmount = Number(payment.amount);
  if (Math.round(verifiedAmount) !== Math.round(paymentAmount)) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return;
  }

  // Mise à jour atomique : on ne confirme que si le statut est encore PENDING
  await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "CONFIRMED" },
    });

    if (updated.count === 0) {
      return; // Déjà traité — idempotence
    }

    if (payment.type === "AGENT_FEATURE") {
      await tx.user.update({
        where: { id: payment.owner_id },
        data: { is_featured: true },
      });
    } else if (payment.property_id) {
      await tx.property.update({
        where: { id: payment.property_id },
        data: { is_featured: true },
      });
    }
  });
};

export const confirmPaymentManuallyService = async (
  paymentId: string
): Promise<Prisma.PaymentGetPayload<{ include: typeof paymentInclude }>> => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: paymentInclude,
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.status !== "PENDING") {
    throw new AppError("Payment is not in pending status", 400);
  }

  // Confirmer manuellement + activer featured
  const [updatedPayment] = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: { status: "CONFIRMED" },
      include: paymentInclude,
    });

    if (payment.type === "AGENT_FEATURE") {
      await tx.user.update({
        where: { id: payment.owner_id },
        data: { is_featured: true },
      });
    } else if (payment.property_id) {
      await tx.property.update({
        where: { id: payment.property_id },
        data: { is_featured: true },
      });
    }

    return [updated];
  });

  return updatedPayment;
};

export const getMyPaymentsService = async (
  ownerId: string,
  query: PaymentsListQuery
) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.PaymentWhereInput = {
    owner_id: ownerId,
  };

  if (query.status) {
    where.status = query.status as PaymentStatus;
  }

  if (query.property_id) {
    where.property_id = query.property_id;
  }

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: paymentInclude,
    }),
  ]);

  return {
    payments,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const listPaymentsService = async (query: PaymentsListQuery) => {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.PaymentWhereInput = {};

  if (query.status) {
    where.status = query.status as PaymentStatus;
  }

  if (query.property_id) {
    where.property_id = query.property_id;
  }

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: paymentInclude,
    }),
  ]);

  return {
    payments,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPaymentService = async (
  paymentId: string,
  requesterId: string,
  requesterRole: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: paymentInclude,
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  // Un owner ne peut voir que ses propres paiements
  if (requesterRole === "OWNER" && payment.owner_id !== requesterId) {
    throw new AppError("You are not allowed to view this payment", 403);
  }

  return payment;
};