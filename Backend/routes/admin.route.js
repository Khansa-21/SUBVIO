import { Router } from "express";
import {
  deleteAdminSubscription,
  deleteAdminUser,
  getAdminDashboard,
  getAdminSubscriptions,
  getAdminUserById,
  getAdminUsers,
  updateAdminUserRole,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/dashboard", getAdminDashboard);

adminRouter.get("/users", getAdminUsers);
adminRouter.get("/users/:id", getAdminUserById);
adminRouter.patch("/users/:id/role", updateAdminUserRole);
adminRouter.delete("/users/:id", deleteAdminUser);

adminRouter.get("/subscriptions", getAdminSubscriptions);
adminRouter.delete("/subscriptions/:id", deleteAdminSubscription);

export default adminRouter;
