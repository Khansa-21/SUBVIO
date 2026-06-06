import { Router } from "express";

import {
  signUp,
  logIn,
  signOut,
  forgotPassword,
  resetPassword,
  verifyResetToken
} from "../controllers/auth.controller.js";

import {requireAuth} from "../middlewares/auth.middleware.js";
const authRouter = Router();

// Routes
authRouter.post("/sign-up", signUp);
authRouter.post("/log-in", logIn);
authRouter.post("/sign-out", requireAuth, signOut);
authRouter.post("/forgot-password", forgotPassword);
authRouter.get("/reset-password/:token", verifyResetToken);
authRouter.post("/reset-password/:token", resetPassword);

export default authRouter;
