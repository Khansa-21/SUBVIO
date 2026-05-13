import mongoose from "mongoose";
// Defining subscription schema
const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is reuired"],
      trim: true,
      minLength: 3,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Subscription Price is reuired"],
      min: [0, "Price must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
      default: "USD",
    },
    frequency: {
      type: String,
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
      required: [true, "Category is reuired"],
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
  },
  { timestamps: true }
);

// Auto calculate renewal date if missing
subscriptionSchema.pre("save", function (next) {
  const okFreq = ["daily", "weekly", "monthly", "yearly"];
  if (!okFreq.includes(this.frequency)) {
    return next(new Error("Invalid frequency"));
  }

  if (!this.renewalDate) {
    const d = new Date(this.startDate);

    switch (this.frequency) {
      case "daily":
        d.setDate(d.getDate() + 1);
        break;
      case "weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "monthly":
        d.setMonth(d.getMonth() + 1); // month-aware
        break;
      case "yearly":
        d.setFullYear(d.getFullYear() + 1); // leap-year aware
        break;
    }

    this.renewalDate = d;
  }

  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }

  next();
});

// creating model of the above schema
const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
