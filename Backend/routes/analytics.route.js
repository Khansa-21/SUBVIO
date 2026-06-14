import { Router } from "express";
import { getMonthlyAnalytics } from "../controllers/analytics.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const analyticsRouter = Router();

analyticsRouter.get("/monthly", requireAuth, getMonthlyAnalytics);

export default analyticsRouter;
