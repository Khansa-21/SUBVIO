import { Router } from "express";
import { NODE_ENV } from "../config/env.js";
import HttpError from "../utils/httpError.js";

const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Subscription Tracker API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: "1.0.0",
  });
});

healthRouter.get("/db", async (req, res, next) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const state = mongoose.connection.readyState;

    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.status(200).json({
      status: "success",
      database: states[state] || "unknown",
      readyState: state,
    });
  } catch (error) {
    next(new HttpError(500, "Database check failed", error.message));
  }
});

export default healthRouter;
