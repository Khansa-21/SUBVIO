import { Router } from "express";
import {
  cancelAdminSubscription,
  deleteAdminSubscription,
  deleteAdminUser,
  getAdminDashboard,
  getAdminSubscriptionById,
  getAdminSubscriptions,
  getAdminUserSubscriptions,
  getAdminUserById,
  getAdminUsers,
  updateAdminUserRole,
} from "../controllers/admin.controller.js";
import requireAdmin from "../middlewares/admin.middleware.js";
import requireAuth from "../middlewares/auth.middleware.js";

const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/dashboard", getAdminDashboard);

adminRouter.get("/users", getAdminUsers);
adminRouter.get("/users/:id", getAdminUserById);
adminRouter.get("/users/:id/subscriptions", getAdminUserSubscriptions);
adminRouter.patch("/users/:id/role", updateAdminUserRole);
adminRouter.delete("/users/:id", deleteAdminUser);

adminRouter.get("/subscriptions", getAdminSubscriptions);
adminRouter.get("/subscriptions/:id", getAdminSubscriptionById);
adminRouter.patch("/subscriptions/:id/cancel", cancelAdminSubscription);
adminRouter.delete("/subscriptions/:id", deleteAdminSubscription);

export default adminRouter;
