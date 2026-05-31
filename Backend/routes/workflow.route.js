import { Router } from "express";
import { sendReminders } from "../controllers/workflow.controller.js";
import { QSTASH_TOKEN } from "../config/env.js";

const workflowRouter = Router();

const verifyWorkflowToken = (req, res, next) => {
  const token = req.headers["x-workflow-token"];

  if (!QSTASH_TOKEN || token !== QSTASH_TOKEN) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized workflow request",
    });
  }

  next();
};

workflowRouter.post("/subscription/reminder", verifyWorkflowToken, sendReminders);

export default workflowRouter;
