import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import {
  createPropertyService,
  listPropertiesService,
  getPropertyService,
  updatePropertyService,
  deletePropertyService,
  getMyPropertiesService,
  updatePropertyStatusService,
  featurePropertyService,
  listPendingPropertiesService,
} from "./properties.service";
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  UpdatePropertyStatusDto,
  PropertiesListQuery,
} from "./properties.types";

export const createProperty = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as CreatePropertyDto;
    const property = await createPropertyService(req.user!.id, dto);
    sendSuccess(res, property, "Property created successfully", 201);
  }
);

export const listProperties = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as PropertiesListQuery;
    const result = await listPropertiesService(query);
    sendPaginated(
      res,
      result.properties,
      result.meta,
      "Properties fetched successfully"
    );
  }
);

export const getProperty = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const property = await getPropertyService(req.params.id as string);
    sendSuccess(res, property, "Property fetched successfully");
  }
);

export const updateProperty = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as UpdatePropertyDto;
    const property = await updatePropertyService(
      req.params.id as string,
      req.user!.id,
      dto
    );
    sendSuccess(res, property, "Property updated successfully");
  }
);

export const deleteProperty = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await deletePropertyService(req.params.id as string, req.user!.id);
    sendSuccess(res, null, "Property deleted successfully");
  }
);

export const getMyProperties = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as PropertiesListQuery;
    const result = await getMyPropertiesService(req.user!.id, query);
    sendPaginated(
      res,
      result.properties,
      result.meta,
      "Properties fetched successfully"
    );
  }
);

export const updatePropertyStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as UpdatePropertyStatusDto;
    const property = await updatePropertyStatusService(req.params.id as string, dto);
    sendSuccess(res, property, "Property status updated successfully");
  }
);

export const featureProperty = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const property = await featurePropertyService(req.params.id as string);
    sendSuccess(res, property, "Property featured successfully");
  }
);

export const listPendingProperties = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as PropertiesListQuery;
    const result = await listPendingPropertiesService(query);
    sendPaginated(
      res,
      result.properties,
      result.meta,
      "Pending properties fetched successfully"
    );
  }
);