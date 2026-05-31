import { Router } from "express";
import {
  deleteCurrentUser,
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserPassword,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/me", requireAuth, getCurrentUser);
userRouter.patch("/me", requireAuth, updateCurrentUser);
userRouter.patch("/me/password", requireAuth, updateCurrentUserPassword);
userRouter.delete("/me", requireAuth, deleteCurrentUser);

export default userRouter;
