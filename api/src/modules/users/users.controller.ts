import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import {
  getProfileService,
  updateProfileService,
  changePasswordService,
  listUsersService,
  getUserService,
  suspendUserService,
  unsuspendUserService,
  featureUserService,
  deleteUserService,
} from "./users.service";
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UsersListQuery,
} from "./users.types";

export const getProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await getProfileService(req.user!.id);
    sendSuccess(res, user, "Profile fetched successfully");
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as UpdateProfileDto;
    const user = await updateProfileService(req.user!.id, dto);
    sendSuccess(res, user, "Profile updated successfully");
  }
);

export const changePassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as ChangePasswordDto;
    await changePasswordService(req.user!.id, dto);
    sendSuccess(res, null, "Password changed successfully");
  }
);

export const listUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as UsersListQuery;
    const result = await listUsersService(query);
    sendPaginated(res, result.users, result.meta, "Users fetched successfully");
  }
);

export const getUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const user = await getUserService(id);
    sendSuccess(res, user, "User fetched successfully");
  }
);

export const suspendUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const user = await suspendUserService(id, req.user!.id);
    sendSuccess(res, user, "User suspended successfully");
  }
);

export const unsuspendUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const user = await unsuspendUserService(id, req.user!.id);
    sendSuccess(res, user, "User unsuspended successfully");
  }
);

export const featureUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const user = await featureUserService(id, req.user!.id);
    sendSuccess(res, user, "User featured status toggled successfully");
  }
);

export const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    await deleteUserService(id, req.user!.id);
    sendSuccess(res, null, "User deleted successfully");
  }
);