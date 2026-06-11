import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  initiatePayment,
  handleWebhook,
  confirmPaymentManually,
  getMyPayments,
  listPayments,
  getPayment,
} from "./payments.controller";
import {
  initiatePaymentValidator,
  paymentIdValidator,
  paymentsListValidator,
  confirmPaymentValidator,
} from "./payments.validator";

const router = Router();

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Webhook Flutterwave (appelé par Flutterwave)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook traité
 */
router.post("/webhook", handleWebhook);

/**
 * @swagger
 * /payments/initiate:
 *   post:
 *     summary: Initier un paiement (Owner)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InitiatePaymentDto'
 *     responses:
 *       200:
 *         description: Paiement initié
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/initiate",
  authenticate,
  authorize("OWNER"),
  validate(initiatePaymentValidator),
  initiatePayment
);

/**
 * @swagger
 * /payments/my:
 *   get:
 *     summary: Mes paiements (Owner)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, FAILED]
 *       - in: query
 *         name: property_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste de mes paiements
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/my",
  authenticate,
  authorize("OWNER"),
  validate(paymentsListValidator),
  getMyPayments
);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Détail d'un paiement
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Paiement récupéré
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:id",
  authenticate,
  authorize("OWNER", "ADMIN"),
  validate(paymentIdValidator),
  getPayment
);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Lister tous les paiements (Admin)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, FAILED]
 *       - in: query
 *         name: property_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des paiements
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(paymentsListValidator),
  listPayments
);

/**
 * @swagger
 * /payments/{id}/confirm:
 *   patch:
 *     summary: Confirmer manuellement un paiement (Admin)
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Paiement confirmé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id/confirm",
  authenticate,
  authorize("ADMIN"),
  validate(confirmPaymentValidator),
  confirmPaymentManually
);

export default router;