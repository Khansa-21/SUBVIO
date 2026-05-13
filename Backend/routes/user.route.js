import { Router } from "express";
import {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import isAdmin from "../middlewares/admin.middleware.js";

const userRouter = Router();

// Routes
userRouter.get("/", authorize, isAdmin, getUsers);                           
userRouter.get("/:id", authorize, getUser);
userRouter.put("/:id", authorize, updateUser);
userRouter.delete("/:id", authorize, isAdmin, deleteUser);

export default userRouter;
  