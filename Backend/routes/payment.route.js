import { Router } from "express";
import {
  createCheckoutSession,
  verifyCheckoutSession,
} from "../controllers/payment.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

paymentRouter.post("/checkout", requireAuth, createCheckoutSession);
paymentRouter.get("/verify/:sessionId", requireAuth, verifyCheckoutSession);

export default paymentRouter;
