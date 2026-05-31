import Stripe from "stripe";
import { STRIPE_SECRET_KEY, FRONTEND_URL } from "../config/env.js";
import Subscription from "../models/subscription.model.js";
import HttpError from "../utils/httpError.js";
import {
  buildSubscriptionPayload,
  ensurePositivePrice,
} from "../utils/subscriptionPayload.js";
import {
  ensureOnlyAllowedFields,
  normalizeString,
} from "../utils/validator.js";

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;
const APP_URL = FRONTEND_URL || "http://localhost:3000";

const checkoutFields = [
  "name",
  "price",
  "currency",
  "frequency",
  "category",
  "paymentMethod",
  "startDate",
  "renewalDate",
];

const getStripe = () => {
  if (!stripe) {
    throw new HttpError(503, "Stripe payment service is not configured");
  }

  return stripe;
};

const buildCheckoutMetadata = (payload, userId) => {
  return checkoutFields.reduce(
    (metadata, field) => {
      if (payload[field] !== undefined && payload[field] !== null) {
        metadata[field] = String(payload[field]);
      }

      return metadata;
    },
    { userId: String(userId) },
  );
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, checkoutFields);

    const stripeClient = getStripe();
    const payload = buildSubscriptionPayload(req.body);
    ensurePositivePrice(payload.price);

    const requiredFields = [
      "name",
      "price",
      "frequency",
      "category",
      "startDate",
    ];
    const missingFields = requiredFields.filter((field) => !payload[field]);
    if (missingFields.length) {
      throw new HttpError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`,
      );
    }

    const existing = await Subscription.findOne({
      user: req.user._id,
      name: payload.name,
    });
    if (existing) {
      throw new HttpError(400, "Subscription already exists for this user");
    }

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: (payload.currency || "USD").toLowerCase(),
            product_data: { name: payload.name },
            unit_amount: Math.round(payload.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: buildCheckoutMetadata(payload, req.user._id),
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/cancel`,
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
};

export const verifyCheckoutSession = async (req, res, next) => {
  try {
    const stripeClient = getStripe();
    const sessionId = normalizeString(req.params.sessionId, { maxLength: 255 });
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.userId !== req.user._id.toString()) {
      throw new HttpError(403, "Payment session does not belong to this user");
    }

    if (session.payment_status !== "paid") {
      throw new HttpError(400, "Payment has not been completed");
    }

    const existingPaidSubscription = await Subscription.findOne({
      stripeCheckoutSessionId: session.id,
      user: req.user._id,
    });
    if (existingPaidSubscription) {
      return res.status(200).json({
        success: true,
        data: { subscription: existingPaidSubscription },
      });
    }

    const payload = buildSubscriptionPayload(session.metadata || {});
    ensurePositivePrice(payload.price);

    const duplicate = await Subscription.findOne({
      user: req.user._id,
      name: payload.name,
    });
    if (duplicate) {
      throw new HttpError(400, "Subscription already exists for this user");
    }

    const subscription = await Subscription.create({
      ...payload,
      paymentMethod: payload.paymentMethod || "Stripe",
      status: "active",
      user: req.user._id,
      stripeCheckoutSessionId: session.id,
    });

    res.status(201).json({
      success: true,
      data: { subscription },
    });
  } catch (err) {
    next(err);
  }
};
