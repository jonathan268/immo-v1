import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "./favorites.controller";
import { propertyIdParamValidator } from "./favorites.validator";

const router = Router();

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Liste de mes favoris
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des propriétés favorites
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", authenticate, getFavorites);

/**
 * @swagger
 * /favorites/{propertyId}:
 *   post:
 *     summary: Ajouter une annonce aux favoris
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Annonce ajoutée aux favoris
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: L'annonce est déjà dans les favoris
 */
router.post(
  "/:propertyId",
  authenticate,
  validate(propertyIdParamValidator),
  addFavorite
);

/**
 * @swagger
 * /favorites/{propertyId}:
 *   delete:
 *     summary: Retirer une annonce des favoris
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Annonce retirée des favoris
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  "/:propertyId",
  authenticate,
  validate(propertyIdParamValidator),
  removeFavorite
);

/**
 * @swagger
 * /favorites/{propertyId}/check:
 *   get:
 *     summary: Vérifier si une annonce est en favori
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statut du favori
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CheckFavoriteResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:propertyId/check",
  authenticate,
  validate(propertyIdParamValidator),
  checkFavorite
);

export default router;