import { Router } from "express";
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  exportSubscriptions,
  getSubscriptionById,
  getSubscriptions,
  getUpcomingRenewals,
  searchSubscriptions,
  updateSubscription,
} from "../controllers/subscription.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.get("/", requireAuth, getSubscriptions);
subscriptionRouter.post("/", requireAuth, createSubscription);
subscriptionRouter.get("/search/filter", requireAuth, searchSubscriptions);
subscriptionRouter.get("/export", requireAuth, exportSubscriptions);
subscriptionRouter.get("/upcoming", requireAuth, getUpcomingRenewals);
subscriptionRouter.get("/:id", requireAuth, getSubscriptionById);
subscriptionRouter.patch("/:id", requireAuth, updateSubscription);
subscriptionRouter.delete("/:id", requireAuth, deleteSubscription);
subscriptionRouter.patch("/:id/cancel", requireAuth, cancelSubscription);

export default subscriptionRouter;
