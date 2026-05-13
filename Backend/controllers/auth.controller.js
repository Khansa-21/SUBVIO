import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL } from "../config/env.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../utils/send-email.js";
import { validateSignup, validateLogin } from "../utils/validator.js";

export const signUp = async (req, res, next) => {
  // Implementing signup logic
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Logic to create a new user
    const { name, email, password } = req.body;

    // ✅ SIMPLE VALIDATION
    const validation = validateSignup(name, email, password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User Already Exists");
      error.statusCode = 409;
      throw error;
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Creating new user
    const newUsers = await User.create(
      [{ name, email, password: hashPassword }],
      { session },
    );

    // Generating Token for the user
    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // ✅ USE NEW EMAIL SERVICE
    try {
      await sendWelcomeEmail(newUsers[0].email, newUsers[0].name);
    } catch (emailError) {
      console.log("✗ Welcome email failed:", emailError.message);
      // Continue anyway - don't fail signup
    }

    await session.commitTransaction();
    session.endSession();

    // Response
    res.status(201).json({
      success: true,
      message: "✔ User Created Successfully",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const logIn = async (req, res, next) => {
  // Implementing login logic
  try {
    const { email, password } = req.body;

    const validation = validateLogin(email, password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors,
      });
    }

    // Check if user already exists
    const user = await User.findOne({ email }).select("+password");

    // If user doesnot exists
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // if exists
    const isPassword = await bcrypt.compare(password, user.password);

    // if invalid password
    if (!isPassword) {
      const error = new Error("Invalid Password");
      error.statusCode = 401;
      throw error;
    }

    // if valid
    // token creation
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Response
    res.status(200).json({
      success: true,
      message: "User Logged in successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is typically handled on the client side

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // short expiry token
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });

    // Store token in database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // FIXED: Use FRONTEND_URL from environment
    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

    // ✅ USE NEW EMAIL SERVICE
    await sendPasswordResetEmail(user.email, user.name, resetLink);

    res.json({
      success: true,
      message: "Reset link sent to email",
    });
  } catch (err) {
    next(err);
  }
};

export const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user to get email
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If we get here, token is valid!
    res.json({
      success: true,
      message: "Token is valid. You can reset your password.",
      email: user.email, // ← CORRECT: Send actual email
      name: user.name,
    });
  } catch (err) {
    // Token is invalid or expired
    res.status(400).json({
      success: false,
      message: "Invalid or expired reset link. Please request a new one.",
    });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, JWT_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.userId, {
      password: hashedPassword,
    });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    err.statusCode = 400;
    err.message = "Invalid or expired token";
    next(err);
  }
};
