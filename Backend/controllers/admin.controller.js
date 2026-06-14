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
import { monthlyValue, roundMoney } from "../utils/money.js";
import {
  deleteUserAndSubscriptions,
  isTransactionUnsupported,
} from "../services/user.service.js";

const getLastTwelveMonthStart = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 11);
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getGrowthPipeline = (startDate) => [
  { $match: { createdAt: { $gte: startDate } } },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
      count: { $sum: 1 },
    },
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } },
];

const fillLastTwelveMonths = (rows) => {
  const counts = new Map(
    rows.map((row) => [`${row._id.year}-${row._id.month}`, row.count]),
  );

  return Array.from({ length: 12 }, (_, index) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    return counts.get(`${date.getFullYear()}-${date.getMonth() + 1}`) || 0;
  });
};

const getDelta = (current, previous) => current - previous;

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

    try {
      await session.withTransaction(() =>
        deleteUserAndSubscriptions(userId, session),
      );
    } catch (transactionError) {
      if (!isTransactionUnsupported(transactionError)) {
        throw transactionError;
      }

      await deleteUserAndSubscriptions(userId);
    }

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

export const getAdminSubscriptionById = async (req, res, next) => {
  try {
    const subscriptionId = normalizeObjectId(req.params.id, "subscription id");
    const subscription = await Subscription.findById(subscriptionId).populate(
      "user",
      "name email role",
    );

    if (!subscription) {
      throw new HttpError(404, "Subscription not found");
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUserSubscriptions = async (req, res, next) => {
  try {
    const userId = normalizeObjectId(req.params.id, "user id");
    const user = await User.findById(userId);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const subscriptions = await Subscription.find({ user: userId }).sort({
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

export const cancelAdminSubscription = async (req, res, next) => {
  try {
    const subscriptionId = normalizeObjectId(req.params.id, "subscription id");
    const subscription = await Subscription.findById(subscriptionId).populate(
      "user",
      "name email role",
    );

    if (!subscription) {
      throw new HttpError(404, "Subscription not found");
    }

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
    const currentPeriodStart = new Date(today);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
    const growthStart = getLastTwelveMonthStart();

    const [
      totalUsers,
      totalSubscriptions,
      activeSubscriptions,
      canceledSubscriptions,
      activeUserIds,
      subscriptions,
      upcomingRenewals,
      popularCategories,
      popularPlatforms,
      currentUsers,
      previousUsers,
      currentSubscriptions,
      previousSubscriptions,
      currentActiveSubscriptions,
      previousActiveSubscriptions,
      currentCanceledSubscriptions,
      previousCanceledSubscriptions,
      userGrowthRows,
      subscriptionGrowthRows,
    ] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: "active" }),
      Subscription.countDocuments({ status: "cancelled" }),
      Subscription.distinct("user", { status: "active" }),
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
      User.countDocuments({ createdAt: { $gte: currentPeriodStart } }),
      User.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart },
      }),
      Subscription.countDocuments({
        createdAt: { $gte: currentPeriodStart },
      }),
      Subscription.countDocuments({
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart },
      }),
      Subscription.countDocuments({
        status: "active",
        createdAt: { $gte: currentPeriodStart },
      }),
      Subscription.countDocuments({
        status: "active",
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart },
      }),
      Subscription.countDocuments({
        status: "cancelled",
        createdAt: { $gte: currentPeriodStart },
      }),
      Subscription.countDocuments({
        status: "cancelled",
        createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart },
      }),
      User.aggregate(getGrowthPipeline(growthStart)),
      Subscription.aggregate(getGrowthPipeline(growthStart)),
    ]);

    const monthlyRecurringRevenue = subscriptions.reduce((total, sub) => {
      return total + monthlyValue(sub);
    }, 0);
    const growth = {
      users: fillLastTwelveMonths(userGrowthRows),
      subscriptions: fillLastTwelveMonths(subscriptionGrowthRows),
    };
    const currentPeriodStats = {
      users: currentUsers,
      subscriptions: currentSubscriptions,
      activeSubscriptions: currentActiveSubscriptions,
      canceledSubscriptions: currentCanceledSubscriptions,
      cancelledSubscriptions: currentCanceledSubscriptions,
    };
    const previousPeriodStats = {
      users: previousUsers,
      subscriptions: previousSubscriptions,
      activeSubscriptions: previousActiveSubscriptions,
      canceledSubscriptions: previousCanceledSubscriptions,
      cancelledSubscriptions: previousCanceledSubscriptions,
    };
    const deltas = {
      users: getDelta(currentUsers, previousUsers),
      subscriptions: getDelta(currentSubscriptions, previousSubscriptions),
      activeSubscriptions: getDelta(
        currentActiveSubscriptions,
        previousActiveSubscriptions,
      ),
      canceledSubscriptions: getDelta(
        currentCanceledSubscriptions,
        previousCanceledSubscriptions,
      ),
      cancelledSubscriptions: getDelta(
        currentCanceledSubscriptions,
        previousCanceledSubscriptions,
      ),
    };

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
        monthlyRecurringRevenue: roundMoney(monthlyRecurringRevenue),
        growth,
        currentPeriodStats,
        previousPeriodStats,
        deltas,
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
