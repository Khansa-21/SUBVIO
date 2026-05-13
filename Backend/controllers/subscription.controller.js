import { SERVER_URL } from "../config/env.js";
import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { sendSubscriptionConfirmation } from "../utils/send-email.js";
import User from "../models/user.model.js";

// ✅ Create Subscription
export const createSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name } = req.body;

    // if user already have the same subscription
    const existing = await Subscription.findOne({ user: userId, name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Subscription already exists for this user",
      });
    }

    const subscription = await Subscription.create({
      ...req.body,
      user: userId,
    });

    // 🔥 STEP 1: SEND IMMEDIATE CONFIRMATION EMAIL (ADD THIS)
    try {
      // Get user details for email
      const user = await User.findById(userId);

      if (user && user.email) {
        await sendSubscriptionConfirmation({
          to: user.email,
          subscription: subscription,
          userName: user.name,
        });
        console.log(`📧 Confirmation email sent for ${subscription.name}`);
      } else {
        console.warn("⚠️ User not found or no email");
      }
    } catch (emailError) {
      console.warn(
        "⚠️ Email failed, but subscription saved:",
        emailError.message
      );
      // Continue even if email fails - don't break the request
    }

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v-1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res.status(201).json({
      success: true,
      data: { subscription, workflowRunId },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get Single Subscription by ID
export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!subscription) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    // ✅ Access control
    if (
      req.user.role !== "admin" &&
      subscription.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Subscription
export const updateSubscription = async (req, res, next) => {
  try {
    // ✅ ONLY NEED THIS VALIDATION: Price check
    if (req.body.price !== undefined && req.body.price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    // Fetch the subscription
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Access control (only admin or owner)
    if (
      req.user.role !== "admin" &&
      subscription.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    //  Update subscription
    const updated = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete Subscription
export const deleteSubscription = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      const error = new Error("You are not the owner of this account");
      error.status = 401; 
      throw error;
    }

    const deleted = await Subscription.findByIdAndDelete(req.params.id);

    if (!deleted) {
      const error = new Error("Subscription not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get Subscriptions for a Specific User
export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      const error = new Error("You are not the owner of this account");
      err.status = 401;
      throw error;
    }
    const subscriptions = await Subscription.find({
      user: req.params.id,
    });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Cancel Subscription
export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (
      req.user.role !== "admin" &&
      subscription.user.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    //  Cancel (status update)
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

// ✅ Get Upcoming Renewals
export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    const query = req.user.role === "admin" ? {} : { user: req.user._id };

    const renewals = await Subscription.find({
      ...query,
      renewalDate: { $gte: today, $lte: next7Days },
    }).populate("user", "name email");

    res.status(200).json({
      success: true,
      data: renewals,
    });
  } catch (error) {
    next(error);
  }
};

// Function that fetches all the Subscriptions
// ✅ Get All Subscriptions (Admin only)

export const getAllSubscriptions = async (req, res, next) => {
  try {
    // // ✅ Only allow admin to fetch all subscriptions
    // if (req.user.role !== "admin") {
    //   const error = new Error("Access denied: Admins only");
    //   error.status = 403;
    //   throw error;
    // }

    const allSubscriptions = await Subscription.find().populate(
      "user",
      "name email"
    );

    res.status(200).json({
      success: true,
      data: allSubscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ SEARCH & FILTER SUBSCRIPTIONS
export const searchSubscriptions = async (req, res, next) => {
  try {
    const { 
      q, // search term
      category,
      status,
      minPrice,
      maxPrice,
      startDate,
      endDate 
    } = req.query;
    
    const userId = req.user._id;
    
    // Build query
    let query = { user: userId };
    
    // Search by name
    if (q) {
      query.name = { $regex: q, $options: 'i' }; // Case-insensitive search
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.renewalDate = {};
      if (startDate) query.renewalDate.$gte = new Date(startDate);
      if (endDate) query.renewalDate.$lte = new Date(endDate);
    }
    
    const subscriptions = await Subscription.find(query)
      .sort({ renewalDate: 1 });
    
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
};

// ✅ EXPORT SUBSCRIPTIONS (CSV)
export const exportSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const format = req.query.format || 'csv'; // csv, json, pdf
    
    const subscriptions = await Subscription.find({ user: userId });
    
    if (format === 'csv') {
      // Convert to CSV
      let csv = 'Name,Price,Category,Status,Renewal Date\n';
      
      subscriptions.forEach(sub => {
        csv += `"${sub.name}",${sub.price},${sub.category},${sub.status},"${sub.renewalDate}"\n`;
      });
      
      res.header('Content-Type', 'text/csv');
      res.attachment('subscriptions.csv');
      return res.send(csv);
    }
    
    if (format === 'json') {
      res.attachment('subscriptions.json');
      return res.json(subscriptions);
    }
    
    res.status(400).json({ 
      success: false, 
      message: 'Unsupported format. Use csv or json' 
    });
  } catch (error) {
    next(error);
  }
};