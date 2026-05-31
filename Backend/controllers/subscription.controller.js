import { QSTASH_TOKEN, SERVER_URL } from "../config/env.js";
import { workflowClient, isWorkflowConfigured } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import HttpError from "../utils/httpError.js";
import { sendSubscriptionConfirmation } from "../utils/send-email.js";
import {
  buildSubscriptionPayload,
  ensurePositivePrice,
  subscriptionFields,
} from "../utils/subscriptionPayload.js";
import {
  ensureOnlyAllowedFields,
  escapeRegex,
  normalizeEnum,
  normalizeObjectId,
  normalizeString,
} from "../utils/validator.js";

const findOwnSubscription = async (subscriptionId, userId) => {
  const subscription = await Subscription.findOne({
    _id: subscriptionId,
    user: userId,
  });

  if (!subscription) {
    throw new HttpError(404, "Subscription not found");
  }

  return subscription;
};

const parseQueryNumber = (value, field) => {
  const parsed = Number(normalizeString(value));

  if (!Number.isFinite(parsed)) {
    throw new HttpError(400, `${field} must be a valid number`);
  }

  return parsed;
};

const parseQueryDate = (value, field) => {
  const parsed = new Date(normalizeString(value));

  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError(400, `${field} must be a valid date`);
  }

  return parsed;
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id }).sort({
      renewalDate: 1,
    });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, subscriptionFields);

    const userId = req.user._id;
    const payload = buildSubscriptionPayload(req.body);
    ensurePositivePrice(payload.price);

    const existing = await Subscription.findOne({
      user: userId,
      name: payload.name,
    });
    if (existing) {
      throw new HttpError(400, "Subscription already exists for this user");
    }

    const subscription = await Subscription.create({
      ...payload,
      user: userId,
    });

    try {
      const user = await User.findById(userId);

      if (user?.email) {
        await sendSubscriptionConfirmation({
          to: user.email,
          subscription,
          userName: user.name,
        });
      }
    } catch (emailError) {
      console.warn("Email failed, but subscription saved:", emailError.message);
    }

    let workflowRunId = null;
    if (isWorkflowConfigured && SERVER_URL) {
      try {
        const workflow = await workflowClient.trigger({
          url: `${SERVER_URL}/api/v-1/workflows/subscription/reminder`,
          body: {
            subscriptionId: subscription.id,
          },
          headers: {
            "content-type": "application/json",
            "x-workflow-token": QSTASH_TOKEN,
          },
          retries: 0,
        });
        workflowRunId = workflow.workflowRunId;
      } catch (workflowError) {
        console.warn(
          "Reminder workflow failed, but subscription was saved:",
          workflowError.message,
        );
      }
    }

    res.status(201).json({
      success: true,
      data: { subscription, workflowRunId },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscriptionId = normalizeObjectId(req.params.id, "subscription id");
    const subscription = await findOwnSubscription(subscriptionId, req.user._id);

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, subscriptionFields);
    const updates = buildSubscriptionPayload(req.body);
    ensurePositivePrice(updates.price);
    const subscriptionId = normalizeObjectId(req.params.id, "subscription id");

    if (updates.name !== undefined) {
      const existing = await Subscription.findOne({
        _id: { $ne: subscriptionId },
        user: req.user._id,
        name: updates.name,
      });

      if (existing) {
        throw new HttpError(400, "Subscription already exists for this user");
      }
    }

    const subscription = await findOwnSubscription(subscriptionId, req.user._id);

    Object.assign(subscription, updates);
    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscriptionId = normalizeObjectId(req.params.id, "subscription id");
    const subscription = await Subscription.findOneAndDelete({
      _id: subscriptionId,
      user: req.user._id,
    });

    if (!subscription) {
      throw new HttpError(404, "Subscription not found");
    }

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscriptionId = normalizeObjectId(req.params.id, "subscription id");
    const subscription = await findOwnSubscription(subscriptionId, req.user._id);

    subscription.status = "cancelled";
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    const renewals = await Subscription.find({
      user: req.user._id,
      status: "active",
      renewalDate: { $gte: today, $lte: next7Days },
    }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      data: renewals,
    });
  } catch (error) {
    next(error);
  }
};

export const searchSubscriptions = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.query, [
      "q",
      "name",
      "category",
      "status",
      "minPrice",
      "maxPrice",
      "startDate",
      "endDate",
    ]);

    const {
      q,
      name,
      category,
      status,
      minPrice,
      maxPrice,
      startDate,
      endDate,
    } = req.query;

    const query = { user: req.user._id };
    const searchTerm = escapeRegex(q || name);

    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    if (category) query.category = normalizeEnum(category);
    if (status) query.status = normalizeEnum(status);

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseQueryNumber(minPrice, "minPrice");
      if (maxPrice) query.price.$lte = parseQueryNumber(maxPrice, "maxPrice");
    }

    if (startDate || endDate) {
      query.renewalDate = {};
      if (startDate) {
        query.renewalDate.$gte = parseQueryDate(startDate, "startDate");
      }
      if (endDate) {
        query.renewalDate.$lte = parseQueryDate(endDate, "endDate");
      }
    }

    const subscriptions = await Subscription.find(query).sort({
      renewalDate: 1,
    });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const exportSubscriptions = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.query, ["format"]);

    const format = normalizeEnum(req.query.format || "csv");
    const subscriptions = await Subscription.find({ user: req.user._id });

    if (format === "csv") {
      let csv = "Name,Price,Category,Status,Renewal Date\n";

      subscriptions.forEach((sub) => {
        const row = [
          sub.name,
          sub.price,
          sub.category,
          sub.status,
          sub.renewalDate,
        ];
        csv += `${row.map(escapeCsvValue).join(",")}\n`;
      });

      res.header("Content-Type", "text/csv");
      res.attachment("subscriptions.csv");
      return res.send(csv);
    }

    if (format === "json") {
      res.attachment("subscriptions.json");
      return res.json(subscriptions);
    }

    throw new HttpError(400, "Unsupported format. Use csv or json");
  } catch (error) {
    next(error);
  }
};

const escapeCsvValue = (value) => {
  const stringValue =
    value === null || value === undefined ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
};
