import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { upload } from "../../config/multer";
import {
  uploadImages,
  deleteImage,
  reorderImages,
  getPropertyImages,
} from "./media.controller";
import {
  propertyIdValidator,
  imageIdValidator,
  reorderImagesValidator,
} from "./media.validator";

const router = Router();

/**
 * @swagger
 * /properties/{propertyId}/images:
 *   get:
 *     summary: Récupérer les images d'une annonce
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des images de l'annonce
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
 *                         $ref: '#/components/schemas/PropertyImage'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  "/:propertyId/images",
  validate(propertyIdValidator),
  getPropertyImages
);

/**
 * @swagger
 * /properties/{propertyId}/images:
 *   post:
 *     summary: Uploader des images pour une annonce (Owner)
 *     tags: [Media]
 *     security:
 *       - BearerAuth: []
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             required:
 *               - images
 *     responses:
 *       201:
 *         description: Images uploadées avec succès
 *       400:
 *         description: Maximum 10 images autorisées
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  "/:propertyId/images",
  authenticate,
  authorize("OWNER"),
  validate(propertyIdValidator),
  upload.array("images", 10), // ← multer middleware
  uploadImages
);

/**
 * @swagger
 * /properties/{propertyId}/images/{imageId}:
 *   delete:
 *     summary: Supprimer une image d'une annonce (Owner)
 *     tags: [Media]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Image supprimée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  "/:propertyId/images/:imageId",
  authenticate,
  authorize("OWNER"),
  validate(imageIdValidator),
  deleteImage
);

/**
 * @swagger
 * /properties/{propertyId}/images/reorder:
 *   patch:
 *     summary: Réordonner les images d'une annonce (Owner)
 *     tags: [Media]
 *     security:
 *       - BearerAuth: []
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
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - order
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Images réordonnées
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.patch(
  "/:propertyId/images/reorder",
  authenticate,
  authorize("OWNER"),
  validate(reorderImagesValidator),
  reorderImages
);

export default router;