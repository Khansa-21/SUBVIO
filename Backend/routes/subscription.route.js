import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getAllSubscriptions,
  getUserSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  getUpcomingRenewals,
  searchSubscriptions,
  exportSubscriptions
} from "../controllers/subscription.controller.js";
import isAdmin from "../middlewares/admin.middleware.js";

const subscriptionRouter = Router();

// Routes
subscriptionRouter.get("/", authorize, isAdmin, getAllSubscriptions);
subscriptionRouter.post("/", authorize, createSubscription);
subscriptionRouter.get("/search/filter", authorize, searchSubscriptions);
subscriptionRouter.get("/export", authorize, exportSubscriptions);
subscriptionRouter.get("/upcoming", authorize, getUpcomingRenewals);
subscriptionRouter.get("/:id", authorize, getSubscriptionById);
subscriptionRouter.put("/:id", authorize, updateSubscription);
subscriptionRouter.delete("/:id", authorize, isAdmin, deleteSubscription);
subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);
subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);

export default subscriptionRouter;
