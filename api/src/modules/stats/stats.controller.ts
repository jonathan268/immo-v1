import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { getDashboardStatsService } from "./stats.service";

export const getDashboardStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const stats = await getDashboardStatsService();
    sendSuccess(res, stats, "Stats fetched successfully");
  }
);
