import express from "express";
import cookieParser from "cookie-parser";
import { PORT, FRONTEND_URL } from "./config/env.js";

// Importing Multiple Routes
import authRouter from "./routes/auth.route.js";
import adminRouter from "./routes/admin.route.js";
import userRouter from "./routes/user.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import workflowRouter from "./routes/workflow.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import paymentRouter from "./routes/payment.route.js";
import healthRouter from "./routes/health.route.js";

// database
import connectDb from "./db/mongo.js";

// middlewares
import errorMiddleware from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";

import cors from "cors";

const app = express();

// built-in middlewares
app.use(express.json({ limit: "100kb" }));
app.use(
  express.urlencoded({
    extended: false,
    limit: "100kb",
  }),
);
app.use(cookieParser());

app.use(
  cors({
    origin: FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Arcjet Middleware
app.use(arcjetMiddleware);

// Using Routes
app.use("/api/v-1/auth", authRouter);
app.use("/api/v-1/admin", adminRouter);
app.use("/api/v-1/users", userRouter);
app.use("/api/v-1/subscription", subscriptionRouter);
app.use("/api/v-1/workflows", workflowRouter);
app.use("/api/v-1/analytics", analyticsRouter);
app.use("/api/v-1/payment", paymentRouter);
app.use("/api/v-1/health", healthRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Subvio!");
});
// using Error Middleware
app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(
    `Subscription Tracker API is running on http://localhost:${PORT}`,
  );
  await connectDb();
});

export default app;
