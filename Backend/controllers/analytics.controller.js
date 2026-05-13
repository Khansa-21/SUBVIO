import Subscription from "../models/subscription.model.js";

export const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const data = await Subscription.aggregate([
      {
        $match: { user: userId },
      },
      {
        $group: {
          _id: {
            year: { $year: "$renewalDate" },
            month: { $month: "$renewalDate" },
          },
          totalSpend: { $sum: "$price" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
