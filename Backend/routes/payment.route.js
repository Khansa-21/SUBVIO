import { Router } from "express";
import { createCheckoutSession } from "../controllers/payment.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const paymentRouter = Router();

paymentRouter.post("/checkout", authorize, createCheckoutSession);

export default paymentRouter;
