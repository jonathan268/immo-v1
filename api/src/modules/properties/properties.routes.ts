import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getMyProperties,
  updatePropertyStatus,
  featureProperty,
  listPendingProperties,
} from "./properties.controller";
import {
  createPropertyValidator,
  updatePropertyValidator,
  updatePropertyStatusValidator,
  propertyIdValidator,
  propertiesListValidator,
} from "./properties.validator";

const router = Router();

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Lister les annonces approuvées
 *     tags: [Properties]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *       - in: query
 *         name: property_type
 *         schema:
 *           type: string
 *           enum: [MAISON, BUREAU, ENTREPOT, LOCAL_COMMERCIAL, TERRAIN]
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: size_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: size_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, newest]
 *     responses:
 *       200:
 *         description: Liste des annonces (featured en premier)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get("/", validate(propertiesListValidator), listProperties);

/**
 * @swagger
 * /properties/pending:
 *   get:
 *     summary: Lister les annonces en attente (Admin)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Liste des annonces en attente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/pending",
  authenticate,
  authorize("ADMIN"),
  validate(propertiesListValidator),
  listPendingProperties
);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Détail d'une annonce
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Annonce récupérée
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Property'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(propertyIdValidator), getProperty);

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Créer une annonce (Owner)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyDto'
 *     responses:
 *       201:
 *         description: Annonce créée (statut PENDING)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  "/",
  authenticate,
  authorize("OWNER"),
  validate(createPropertyValidator),
  createProperty
);

/**
 * @swagger
 * /properties/my/listings:
 *   get:
 *     summary: Mes annonces — dashboard owner
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Liste de mes annonces
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/my/listings",
  authenticate,
  authorize("OWNER"),
  validate(propertiesListValidator),
  getMyProperties
);

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Modifier une annonce (Owner)
 *     tags: [Properties]
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
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyDto'
 *     responses:
 *       200:
 *         description: Annonce mise à jour (repasse en PENDING)
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put(
  "/:id",
  authenticate,
  authorize("OWNER"),
  validate(updatePropertyValidator),
  updateProperty
);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Supprimer une annonce — soft delete (Owner)
 *     tags: [Properties]
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
 *         description: Annonce supprimée
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
  authorize("OWNER"),
  validate(propertyIdValidator),
  deleteProperty
);

/**
 * @swagger
 * /properties/{id}/status:
 *   patch:
 *     summary: Valider ou rejeter une annonce (Admin)
 *     tags: [Properties]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate(updatePropertyStatusValidator),
  updatePropertyStatus
);

/**
 * @swagger
 * /properties/{id}/feature:
 *   patch:
 *     summary: Activer la mise en avant (Admin)
 *     tags: [Properties]
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
 *         description: Propriété mise en avant
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id/feature",
  authenticate,
  authorize("ADMIN"),
  validate(propertyIdValidator),
  featureProperty
);

export default router;