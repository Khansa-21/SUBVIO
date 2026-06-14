import Subscription from "../models/subscription.model.js";
import { monthlyValue, roundMoney } from "../utils/money.js";

const DAYS_7 = 7;
const DAYS_30 = 30;
const HIGH_COST_LIMIT = 50;
const CATEGORY_REVIEW_LIMIT = 3;

const daysBetween = (from, to) => {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);

  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const summarizeRenewal = (subscription, today) => ({
  _id: subscription._id,
  name: subscription.name,
  price: subscription.price,
  currency: subscription.currency,
  frequency: subscription.frequency,
  category: subscription.category,
  renewalDate: subscription.renewalDate,
  daysUntilRenewal: daysBetween(today, subscription.renewalDate),
});

const buildCategoryReviews = (subscriptions) => {
  const groups = subscriptions.reduce((acc, subscription) => {
    acc[subscription.category] = acc[subscription.category] || [];
    acc[subscription.category].push(subscription);
    return acc;
  }, {});

  return Object.entries(groups)
    .filter(([, items]) => items.length >= CATEGORY_REVIEW_LIMIT)
    .map(([category, items]) => ({
      category,
      count: items.length,
      estimatedMonthlySpend: roundMoney(
        items.reduce((total, item) => total + monthlyValue(item), 0),
      ),
      subscriptions: items.map((item) => ({
        _id: item._id,
        name: item.name,
        monthlyValue: roundMoney(monthlyValue(item)),
      })),
    }))
    .sort((a, b) => b.estimatedMonthlySpend - a.estimatedMonthlySpend);
};

const buildSavingsOpportunities = (subscriptions) => {
  return subscriptions
    .map((subscription) => {
      const estimatedMonthlyValue = monthlyValue(subscription);

      return {
        _id: subscription._id,
        name: subscription.name,
        category: subscription.category,
        monthlyValue: roundMoney(estimatedMonthlyValue),
        renewalDate: subscription.renewalDate,
        reason:
          estimatedMonthlyValue >= HIGH_COST_LIMIT
            ? "High monthly cost"
            : "Top monthly cost",
      };
    })
    .sort((a, b) => b.monthlyValue - a.monthlyValue)
    .slice(0, 3);
};

export const getActionCenter = async (req, res, next) => {
  try {
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + DAYS_30);

    const subscriptions = await Subscription.find({ user: req.user._id }).sort({
      renewalDate: 1,
    });

    const activeSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "active",
    );
    const upcomingRenewals = activeSubscriptions
      .filter(
        (subscription) =>
          subscription.renewalDate &&
          subscription.renewalDate >= today &&
          subscription.renewalDate <= next30Days,
      )
      .map((subscription) => summarizeRenewal(subscription, today));
    const overdueRenewals = activeSubscriptions
      .filter(
        (subscription) =>
          subscription.renewalDate && subscription.renewalDate < today,
      )
      .map((subscription) => summarizeRenewal(subscription, today));
    const monthlySpend = activeSubscriptions.reduce(
      (total, subscription) => total + monthlyValue(subscription),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSubscriptions: subscriptions.length,
          activeSubscriptions: activeSubscriptions.length,
          estimatedMonthlySpend: roundMoney(monthlySpend),
          upcomingRenewalsCount: upcomingRenewals.length,
          overdueRenewalsCount: overdueRenewals.length,
        },
        upcomingRenewals: {
          next7Days: upcomingRenewals.filter(
            (subscription) => subscription.daysUntilRenewal <= DAYS_7,
          ),
          next30Days: upcomingRenewals,
        },
        overdueRenewals,
        savingsOpportunities: buildSavingsOpportunities(activeSubscriptions),
        categoryReviews: buildCategoryReviews(activeSubscriptions),
      },
    });
  } catch (error) {
    next(error);
  }
};
