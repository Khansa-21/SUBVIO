import { Router } from "express";
import { getActionCenter } from "../controllers/action-center.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const actionCenterRouter = Router();

actionCenterRouter.get("/", requireAuth, getActionCenter);

export default actionCenterRouter;
