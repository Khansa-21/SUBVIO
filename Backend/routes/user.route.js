import { Router } from "express";
import {
  deleteCurrentUser,
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserPassword,
} from "../controllers/user.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const userRouter = Router();
userRouter.use(requireAuth);

userRouter.get("/me", getCurrentUser);
userRouter.patch("/me", updateCurrentUser);
userRouter.patch("/me/password", updateCurrentUserPassword);
userRouter.delete("/me", deleteCurrentUser);

export default userRouter;
