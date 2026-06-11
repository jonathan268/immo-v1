import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import {
  uploadImagesService,
  deleteImageService,
  reorderImagesService,
  getPropertyImagesService,
} from "./media.service";
import { ReorderImagesDto } from "./media.types";

export const uploadImages = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const propertyId = req.params.propertyId as string;
    const files = req.files as Express.Multer.File[];

    const images = await uploadImagesService(
      propertyId,
      req.user!.id,
      files
    );

    sendSuccess(res, images, "Images uploaded successfully", 201);
  }
);

export const deleteImage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const propertyId = req.params.propertyId as string;
    const imageId = req.params.imageId as string;

    await deleteImageService(propertyId, imageId, req.user!.id);
    sendSuccess(res, null, "Image deleted successfully");
  }
);

export const reorderImages = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const propertyId = req.params.propertyId as string;
    const dto = req.body as ReorderImagesDto;

    await reorderImagesService(propertyId, req.user!.id, dto);
    sendSuccess(res, null, "Images reordered successfully");
  }
);

export const getPropertyImages = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const propertyId = req.params.propertyId as string;
    const images = await getPropertyImagesService(propertyId);
    sendSuccess(res, images, "Images fetched successfully");
  }
);