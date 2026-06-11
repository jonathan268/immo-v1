import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createFeatureRequest,
  getMyFeatureRequests,
  getPendingFeatureRequests,
  getFeatureRequest,
  approveFeatureRequest,
  rejectFeatureRequest,
} from './feature-requests.controller';
import {
  createFeatureRequestValidator,
  approveFeatureRequestValidator,
  rejectFeatureRequestValidator,
  featureRequestIdValidator,
  featureRequestsListValidator,
  myFeatureRequestsValidator,
} from './feature-requests.validator';

const router = Router();

/**
 * @swagger
 * /feature-requests:
 *   post:
 *     summary: Créer une demande de mise en avant (Owner/Agent)
 *     tags: [Feature Requests]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFeatureRequestDto'
 *     responses:
 *       201:
 *         description: Demande créée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/',
  authenticate,
  authorize('OWNER'),
  validate(createFeatureRequestValidator),
  createFeatureRequest
);

/**
 * @swagger
 * /feature-requests/my:
 *   get:
 *     summary: Mes demandes de mise en avant
 *     tags: [Feature Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *       - in: query
 *         name: target
 *         schema:
 *           type: string
 *           enum: [AGENT, PROPERTY]
 *     responses:
 *       200:
 *         description: Mes demandes
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/my',
  authenticate,
  authorize('OWNER'),
  validate(myFeatureRequestsValidator),
  getMyFeatureRequests
);

/**
 * @swagger
 * /feature-requests/pending:
 *   get:
 *     summary: Lister les demandes en attente (Admin)
 *     tags: [Feature Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: target
 *         schema:
 *           type: string
 *           enum: [AGENT, PROPERTY]
 *     responses:
 *       200:
 *         description: Demandes en attente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/pending',
  authenticate,
  authorize('ADMIN'),
  validate(featureRequestsListValidator),
  getPendingFeatureRequests
);

/**
 * @swagger
 * /feature-requests/{id}:
 *   get:
 *     summary: Voir une demande de mise en avant
 *     tags: [Feature Requests]
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
 *         description: Demande récupérée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(featureRequestIdValidator),
  getFeatureRequest
);

/**
 * @swagger
 * /feature-requests/{id}/approve:
 *   patch:
 *     summary: Approuver une demande de mise en avant (Admin)
 *     tags: [Feature Requests]
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
 *         description: Demande approuvée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Demande déjà traitée
 */
router.patch(
  '/:id/approve',
  authenticate,
  authorize('ADMIN'),
  validate(approveFeatureRequestValidator),
  approveFeatureRequest
);

/**
 * @swagger
 * /feature-requests/{id}/reject:
 *   patch:
 *     summary: Rejeter une demande de mise en avant (Admin)
 *     tags: [Feature Requests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Demande rejetée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Demande déjà traitée
 */
router.patch(
  '/:id/reject',
  authenticate,
  authorize('ADMIN'),
  validate(rejectFeatureRequestValidator),
  rejectFeatureRequest
);

export default router;
