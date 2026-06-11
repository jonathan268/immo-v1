import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  getUser,
  suspendUser,
  unsuspendUser,
  featureUser,
  deleteUser,
} from "./users.controller";
import {
  updateProfileValidator,
  changePasswordValidator,
  getUserValidator,
  usersListValidator,
} from "./users.validator";

const router = Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Voir son profil
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/profile", authenticate, getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Modifier son profil
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileDto'
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put(
  "/profile",
  authenticate,
  validate(updateProfileValidator),
  updateProfile
);

/**
 * @swagger
 * /users/profile/password:
 *   put:
 *     summary: Changer son mot de passe
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordDto'
 *     responses:
 *       200:
 *         description: Mot de passe modifié avec succès
 *       401:
 *         description: Mot de passe actuel incorrect
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.put(
  "/profile/password",
  authenticate,
  validate(changePasswordValidator),
  changePassword
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lister tous les utilisateurs (Admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, OWNER, TENANT]
 *       - in: query
 *         name: is_suspended
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(usersListValidator),
  listUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Voir un utilisateur (Admin)
 *     tags: [Users]
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
 *         description: Utilisateur récupéré
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
  authorize("ADMIN"),
  validate(getUserValidator),
  getUser
);

/**
 * @swagger
 * /users/{id}/suspend:
 *   patch:
 *     summary: Suspendre un utilisateur (Admin)
 *     tags: [Users]
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
 *         description: Utilisateur suspendu avec succès
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id/suspend",
  authenticate,
  authorize("ADMIN"),
  validate(getUserValidator),
  suspendUser
);

/**
 * @swagger
 * /users/{id}/unsuspend:
 *   patch:
 *     summary: Réactiver un utilisateur suspendu (Admin)
 *     tags: [Users]
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
 *         description: Utilisateur réactivé avec succès
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  "/:id/unsuspend",
  authenticate,
  authorize("ADMIN"),
  validate(getUserValidator),
  unsuspendUser
);

/**
 * @swagger
 * /users/{id}/feature:
 *   patch:
 *     summary: Activer/désactiver la mise en avant d'un agent (Admin)
 *     tags: [Users]
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
 *         description: Statut de mise en avant modifié
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
  validate(getUserValidator),
  featureUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur (Admin)
 *     tags: [Users]
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
 *         description: Utilisateur supprimé avec succès
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
  validate(getUserValidator),
  deleteUser
);

export default router;