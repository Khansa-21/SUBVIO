import mongoose from "mongoose";

export const calculateRenewalDate = (startDate, frequency) => {
  const renewalDate = new Date(startDate);

  switch (frequency) {
    case "daily":
      renewalDate.setDate(renewalDate.getDate() + 1);
      break;
    case "weekly":
      renewalDate.setDate(renewalDate.getDate() + 7);
      break;
    case "monthly":
      renewalDate.setMonth(renewalDate.getMonth() + 1);
      break;
    case "yearly":
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      break;
    default:
      throw new Error("Invalid frequency");
  }

  return renewalDate;
};

// Defining subscription schema
const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Subscription Price is required"],
      min: [0.01, "Price must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
      default: "USD",
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    category: {
      type: String,
      enum: [
        "drama",
        "films",
        "horror",
        "news",
        "sports",
        "entertainment",
        "policies",
        "technology",
        "other",
      ],
      required: [true, "Category is required"],
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Start date must be in the past",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Renewal date must be after the start date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      index: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, name: 1 }, { unique: true });
subscriptionSchema.index(
  { stripeCheckoutSessionId: 1 },
  { unique: true, sparse: true },
);

// Auto calculate renewal date when missing or when billing cadence changes.
subscriptionSchema.pre("save", function (next) {
  const okFreq = ["daily", "weekly", "monthly", "yearly"];
  if (!okFreq.includes(this.frequency)) {
    this.invalidate("frequency", "Frequency is required");
    return next();
  }

  const shouldRecalculateRenewalDate =
    !this.renewalDate ||
    ((this.isModified("startDate") || this.isModified("frequency")) &&
      !this.isModified("renewalDate"));

  if (shouldRecalculateRenewalDate) {
    this.renewalDate = calculateRenewalDate(this.startDate, this.frequency);
  }

  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }

  next();
});

// creating model of the above schema
const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
