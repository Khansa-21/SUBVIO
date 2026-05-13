import mongoose from "mongoose";
// Defining user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name reuired"],
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: String,
      required: [true, "Email reuired"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is reuired"],
      minLength: 8,
      select: false     // Hide password by default (security)
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// creating model of the above schema
const User = mongoose.model("User", userSchema);

export default User;
