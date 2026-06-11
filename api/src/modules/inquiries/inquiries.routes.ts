import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createInquiryLimiter } from "../../middlewares/rateLimit.middleware";
import {
  createInquiry,
  getMyInquiries,
  getInquiry,
  listInquiries,
  deleteInquiry,
} from "./inquiries.controller";
import {
  createInquiryValidator,
  inquiryIdValidator,
  propertyIdParamValidator,
  inquiriesListValidator,
} from "./inquiries.validator";

const router = Router();

/**
 * @swagger
 * /inquiries/{propertyId}:
 *   post:
 *     summary: Envoyer une demande de contact pour une annonce
 *     tags: [Inquiries]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInquiryDto'
 *     responses:
 *       201:
 *         description: Demande de contact envoyée
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/:propertyId",
  createInquiryLimiter(),
  validate([...propertyIdParamValidator, ...createInquiryValidator]),
  createInquiry
);

/**
 * @swagger
 * /inquiries/my/received:
 *   get:
 *     summary: Demandes de contact reçues pour mes annonces (Owner)
 *     tags: [Inquiries]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: property_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des demandes reçues
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/my/received",
  authenticate,
  authorize("OWNER"),
  validate(inquiriesListValidator),
  getMyInquiries
);

/**
 * @swagger
 * /inquiries/{id}:
 *   get:
 *     summary: Détail d'une demande de contact
 *     tags: [Inquiries]
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
 *         description: Demande de contact récupérée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Inquiry'
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
  validate(inquiryIdValidator),
  getInquiry
);

/**
 * @swagger
 * /inquiries:
 *   get:
 *     summary: Lister toutes les demandes de contact (Admin)
 *     tags: [Inquiries]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: property_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des demandes de contact
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(inquiriesListValidator),
  listInquiries
);

/**
 * @swagger
 * /inquiries/{id}:
 *   delete:
 *     summary: Supprimer une demande de contact (Admin)
 *     tags: [Inquiries]
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
 *         description: Demande de contact supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(inquiryIdValidator),
  deleteInquiry
);

export default router;