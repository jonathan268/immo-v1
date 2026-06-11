import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import {
  createInquiryService,
  getMyInquiriesService,
  getInquiryService,
  listInquiriesService,
  deleteInquiryService,
} from "./inquiries.service";
import { CreateInquiryDto, InquiriesListQuery } from "./inquiries.types";

export const createInquiry = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as CreateInquiryDto;
    const propertyId = req.params.propertyId as string;

    // senderId est optionnel — null si visiteur non connecté
    const senderId = req.user?.id;

    const inquiry = await createInquiryService(propertyId, dto, senderId);
    sendSuccess(res, inquiry, "Inquiry sent successfully", 201);
  }
);

export const getMyInquiries = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as InquiriesListQuery;
    const result = await getMyInquiriesService(req.user!.id, query);
    sendPaginated(
      res,
      result.inquiries,
      result.meta,
      "Inquiries fetched successfully"
    );
  }
);

export const getInquiry = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const inquiry = await getInquiryService(
      req.params.id as string,
      req.user!.id,
      req.user!.role
    );
    sendSuccess(res, inquiry, "Inquiry fetched successfully");
  }
);

export const listInquiries = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as InquiriesListQuery;
    const result = await listInquiriesService(query);
    sendPaginated(
      res,
      result.inquiries,
      result.meta,
      "Inquiries fetched successfully"
    );
  }
);

export const deleteInquiry = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await deleteInquiryService(req.params.id as string);
    sendSuccess(res, null, "Inquiry deleted successfully");
  }
);