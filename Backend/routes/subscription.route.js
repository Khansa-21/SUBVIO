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
import requireAuth from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();
subscriptionRouter.use(requireAuth);

subscriptionRouter.get("/", getSubscriptions);
subscriptionRouter.post("/", createSubscription);
subscriptionRouter.get("/search/filter", searchSubscriptions);
subscriptionRouter.get("/export", exportSubscriptions);
subscriptionRouter.get("/upcoming", getUpcomingRenewals);
subscriptionRouter.get("/:id", getSubscriptionById);
subscriptionRouter.patch("/:id", updateSubscription);
subscriptionRouter.delete("/:id", deleteSubscription);
subscriptionRouter.patch("/:id/cancel", cancelSubscription);

export default subscriptionRouter;
