import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { env } from "../../config/env";
import {
  initiatePaymentService,
  handleWebhookService,
  confirmPaymentManuallyService,
  getMyPaymentsService,
  listPaymentsService,
  getPaymentService,
} from "./payments.service";
import {
  InitiatePaymentDto,
  FlutterwaveWebhookDto,
  PaymentsListQuery,
} from "./payments.types";

export const initiatePayment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as InitiatePaymentDto;
    const result = await initiatePaymentService(req.user!.id, dto);
    sendSuccess(res, result, "Payment initiated successfully", 201);
  }
);

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const signature = req.headers["verif-hash"] as string;
    if (signature !== env.flutterwave.secretHash) {
      res.status(401).json({ status: "invalid_signature" });
      return;
    }

    const payload = req.body as FlutterwaveWebhookDto;
    await handleWebhookService(payload, signature);
    res.status(200).json({ status: "received" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ status: "error" });
  }
};

export const confirmPaymentManually = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const payment = await confirmPaymentManuallyService(req.params.id as string);
    sendSuccess(res, payment, "Payment confirmed successfully");
  }
);

export const getMyPayments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as PaymentsListQuery;
    const result = await getMyPaymentsService(req.user!.id, query);
    sendPaginated(
      res,
      result.payments,
      result.meta,
      "Payments fetched successfully"
    );
  }
);

export const listPayments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as PaymentsListQuery;
    const result = await listPaymentsService(query);
    sendPaginated(
      res,
      result.payments,
      result.meta,
      "Payments fetched successfully"
    );
  }
);

export const getPayment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const payment = await getPaymentService(
      req.params.id as string,
      req.user!.id,
      req.user!.role
    );
    sendSuccess(res, payment, "Payment fetched successfully");
  }
);