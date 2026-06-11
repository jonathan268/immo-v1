import { Router } from "express";
import { getDashboardStats } from "./stats.controller";

const router = Router();

router.get("/dashboard", getDashboardStats);

export default router;
