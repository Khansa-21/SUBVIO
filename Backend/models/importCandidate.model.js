import mongoose from "mongoose";

const importCandidateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    payload: {
      name: String,
      price: Number,
      currency: String,
      frequency: String,
      category: String,
      paymentMethod: String,
      status: String,
      startDate: Date,
      renewalDate: Date,
    },
    rawSource: {
      type: String,
      default: "",
      trim: true,
      maxLength: 500,
    },
    importStatus: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
      index: true,
    },
    issues: {
      type: [String],
      default: [],
    },
    duplicate: {
      type: Boolean,
      default: false,
    },
    confirmedSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
  },
  { timestamps: true },
);

importCandidateSchema.index({ user: 1, importStatus: 1, createdAt: -1 });

const ImportCandidate = mongoose.model(
  "ImportCandidate",
  importCandidateSchema,
);

export default ImportCandidate;
