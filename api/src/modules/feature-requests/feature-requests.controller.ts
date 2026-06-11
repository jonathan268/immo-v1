import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../utils/response';
import {
  createFeatureRequestService,
  getMyFeatureRequestsService,
  getPendingFeatureRequestsService,
  getFeatureRequestService,
  approveFeatureRequestService,
  rejectFeatureRequestService,
} from './feature-requests.service';
import {
  CreateFeatureRequestDto,
  FeatureRequestsListQuery,
  MyFeatureRequestsQuery,
} from './feature-requests.types';

export const createFeatureRequest = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dto = req.body as CreateFeatureRequestDto;
    const request = await createFeatureRequestService(req.user!.id, dto);
    sendSuccess(res, request, 'Feature request created successfully', 201);
  }
);

export const getMyFeatureRequests = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as MyFeatureRequestsQuery;
    const result = await getMyFeatureRequestsService(req.user!.id, query);
    sendPaginated(
      res,
      result.requests,
      result.meta,
      'My feature requests fetched successfully'
    );
  }
);

export const getPendingFeatureRequests = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as FeatureRequestsListQuery;
    const result = await getPendingFeatureRequestsService(query);
    sendPaginated(
      res,
      result.requests,
      result.meta,
      'Pending feature requests fetched successfully'
    );
  }
);

export const getFeatureRequest = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const request = await getFeatureRequestService(req.params.id as string);
    sendSuccess(res, request, 'Feature request fetched successfully');
  }
);

export const approveFeatureRequest = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const request = await approveFeatureRequestService(
      req.params.id as string,
      req.user!.id
    );
    sendSuccess(res, request, 'Feature request approved successfully');
  }
);

export const rejectFeatureRequest = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const rejectionReason = (req.body as any).rejection_reason as
      | string
      | undefined;
    const request = await rejectFeatureRequestService(
      req.params.id as string,
      req.user!.id,
      rejectionReason
    );
    sendSuccess(res, request, 'Feature request rejected successfully');
  }
);
