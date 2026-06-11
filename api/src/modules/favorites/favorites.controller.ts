import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import {
  getFavoritesService,
  addFavoriteService,
  removeFavoriteService,
  checkFavoriteService,
} from "./favorites.service";

export const getFavorites = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const properties = await getFavoritesService(req.user!.id);
    sendSuccess(res, properties, "Favorites fetched successfully");
  }
);

export const addFavorite = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const propertyId = req.params.propertyId as string;
    await addFavoriteService(req.user!.id, propertyId);
    sendSuccess(res, null, "Property added to favorites", 201);
  }
);

export const removeFavorite = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const propertyId = req.params.propertyId as string;
    await removeFavoriteService(req.user!.id, propertyId);
    sendSuccess(res, null, "Property removed from favorites");
  }
);

export const checkFavorite = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const propertyId = req.params.propertyId as string;
    const result = await checkFavoriteService(req.user!.id, propertyId);
    sendSuccess(res, result, "Favorite status checked");
  }
);