import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET, FRONTEND_URL } from "../config/env.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../utils/send-email.js";
import {
  ensureOnlyAllowedFields,
  normalizeEmail,
  normalizeString,
  validateSignup,
  validateLogin,
  validatePassword,
} from "../utils/validator.js";
import {
  clearAuthCookie,
  createAuthToken,
  publicUser,
  setAuthCookie,
  validateResetToken,
} from "../utils/authHelper.js";
import HttpError from "../utils/httpError.js";

const APP_URL = FRONTEND_URL || "http://localhost:3000";

export const signUp = async (req, res, next) => {
  let session;

  try {
    ensureOnlyAllowedFields(req.body, ["name", "email", "password"]);

    const name = normalizeString(req.body.name, { maxLength: 30 });
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    const validation = validateSignup(name, email, password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new HttpError(409, "User already exists");
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session },
    );
    const user = newUsers[0];

    const token = createAuthToken(user);

    const emailResult = await sendWelcomeEmail(user.email, user.name);
    if (!emailResult.success) {
      console.log("Welcome email failed:", emailResult.error);
    }

    await session.commitTransaction();
    session.endSession();

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user: publicUser(user) },
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    next(error);
  }
};

export const logIn = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, ["email", "password"]);

    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    const validation = validateLogin(email, password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors,
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid password");
    }

    const token = createAuthToken(user);

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: { user: publicUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, ["email"]);

    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists, a reset link will be sent to that email",
      });
    }

    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${APP_URL}/reset-password/${resetToken}`;
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetLink,
    );

    if (!emailResult.success) {
      console.warn("Password reset email failed:", emailResult.error);
    }

    res.json({
      success: true,
      message: "If an account exists, a reset link will be sent to that email",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetToken = async (req, res, next) => {
  try {
    const token = normalizeString(req.params.token);
    const user = await validateResetToken(token);

    res.json({
      success: true,
      message: "Token is valid. You can reset your password.",
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, ["password"]);

    const token = normalizeString(req.params.token);
    const { password } = req.body;

    const validation = validatePassword(password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors,
      });
    }
    const user = await validateResetToken(token);

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    error.statusCode = 400;
    error.message = "Invalid or expired token";
    next(error);
  }
};
