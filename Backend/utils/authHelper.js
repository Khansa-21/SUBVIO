import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } from "../config/env.js";
import User from "../models/user.model.js";
import HttpError from "./httpError.js";

export const AUTH_COOKIE_NAME = "auth_token";

const expiresInToMs = (expiresIn = "7d") => {
  const match = String(expiresIn).match(/^(\d+)([smhd])$/);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
};

export const createAuthToken = (user) => {
  return jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const authCookieOptions = () => ({
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax",
  maxAge: expiresInToMs(JWT_EXPIRES_IN),
});

export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
  });
};

export const getAuthTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  const authHeader = req.headers?.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  return cookieToken || bearerToken;
};

export const publicUser = (user) => {
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.password;
  delete value.resetPasswordToken;
  delete value.resetPasswordExpire;
  return value;
};

export const validateResetToken = async (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);

  const user = await User.findById(decoded.userId);

  if (
    !user ||
    user.resetPasswordToken !== token ||
    !user.resetPasswordExpire ||
    user.resetPasswordExpire < Date.now()
  ) {
    throw new HttpError(400, "Invalid or expired reset token");
  }

  return user;
};
