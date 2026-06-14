import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { clearAuthCookie, publicUser } from "../utils/authHelper.js";
import HttpError from "../utils/httpError.js";
import {
  deleteUserAndSubscriptions,
  isTransactionUnsupported,
} from "../services/user.service.js";
import {
  assertValid,
  ensureOnlyAllowedFields,
  normalizeEmail,
  normalizeString,
  pickAllowedFields,
  validatePassword,
} from "../utils/validator.js";

export const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: publicUser(req.user) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, ["name", "email"]);

    const updates = pickAllowedFields(req.body, ["name", "email"]);
    if (updates.name) {
      updates.name = normalizeString(updates.name, { maxLength: 30 });
    }

    if (updates.email) {
      updates.email = normalizeEmail(updates.email);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -resetPasswordToken -resetPasswordExpire");

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUserPassword = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, ["currentPassword", "password"]);

    const { currentPassword, password } = req.body;
    assertValid(validatePassword(password));

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword || "",
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpError(401, "Current password is incorrect");
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCurrentUser = async (req, res, next) => {
  let session;

  try {
    session = await mongoose.startSession();

    try {
      await session.withTransaction(() =>
        deleteUserAndSubscriptions(req.user._id, session),
      );
    } catch (transactionError) {
      if (!isTransactionUnsupported(transactionError)) {
        throw transactionError;
      }

      await deleteUserAndSubscriptions(req.user._id);
    }

    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
