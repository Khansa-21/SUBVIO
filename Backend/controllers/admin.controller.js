import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import { publicUser } from "../utils/authHelper.js";
import HttpError from "../utils/httpError.js";
import {
  ensureOnlyAllowedFields,
  normalizeEnum,
  normalizeObjectId,
} from "../utils/validator.js";

const monthlyValue = (subscription) => {
  switch (subscription.frequency) {
    case "daily":
      return subscription.price * 30;
    case "weekly":
      return (subscription.price * 52) / 12;
    case "monthly":
      return subscription.price;
    case "yearly":
      return subscription.price / 12;
    default:
      return 0;
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(publicUser),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUserById = async (req, res, next) => {
  try {
    const userId = normalizeObjectId(req.params.id, "user id");
    const user = await User.findById(userId);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      data: { user: publicUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUserRole = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, ["role"]);
    const role = normalizeEnum(req.body.role);
    const userId = normalizeObjectId(req.params.id, "user id");

    if (!["admin", "user"].includes(role)) {
      throw new HttpError(400, "Role must be either admin or user");
    }

    if (req.user._id.toString() === userId) {
      throw new HttpError(403, "Admins cannot change their own role");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      data: { user: publicUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req, res, next) => {
  let session;

  try {
    const userId = normalizeObjectId(req.params.id, "user id");

    if (req.user._id.toString() === userId) {
      throw new HttpError(403, "Admins cannot delete their own account");
    }

    session = await mongoose.startSession();
    let user;

    await session.withTransaction(async () => {
      user = await User.findById(userId).session(session);

      if (!user) {
        throw new HttpError(404, "User not found");
      }

      await Subscription.deleteMany({ user: user._id }).session(session);
      await User.deleteOne({ _id: user._id }).session(session);
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const getAdminSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminSubscription = async (req, res, next) => {
  try {
    const subscriptionId = normalizeObjectId(req.params.id, "subscription id");
    const subscription = await Subscription.findByIdAndDelete(subscriptionId);

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

export const getAdminDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    const [
      totalUsers,
      totalSubscriptions,
      activeSubscriptions,
      canceledSubscriptions,
      subscriptions,
      upcomingRenewals,
      popularCategories,
      popularPlatforms,
    ] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: "active" }),
      Subscription.countDocuments({ status: "cancelled" }),
      Subscription.find({ status: "active" }),
      Subscription.find({
        status: "active",
        renewalDate: { $gte: today, $lte: next7Days },
      })
        .populate("user", "name email")
        .sort({ renewalDate: 1 }),
      Subscription.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Subscription.aggregate([
        { $group: { _id: "$name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const activeUserIds = await Subscription.distinct("user", {
      status: "active",
    });

    const monthlyRecurringRevenue = subscriptions.reduce((total, sub) => {
      return total + monthlyValue(sub);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers: activeUserIds.length,
        totalSubscriptions,
        subscriptionsByStatus: {
          active: activeSubscriptions,
          canceled: canceledSubscriptions,
          cancelled: canceledSubscriptions,
        },
        monthlyRecurringRevenue,
        upcomingRenewals,
        mostPopularCategories: popularCategories.map((item) => ({
          category: item._id,
          count: item.count,
        })),
        mostPopularPlatforms: popularPlatforms.map((item) => ({
          platform: item._id,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
