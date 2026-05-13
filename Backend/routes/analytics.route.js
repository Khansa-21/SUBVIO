import { Router } from "express";
import { getMonthlyAnalytics } from "../controllers/analytics.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const analyticsRouter = Router();

analyticsRouter.get("/monthly", authorize, getMonthlyAnalytics);

export default analyticsRouter;
