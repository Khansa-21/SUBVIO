import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.model.js";
import { getAuthTokenFromRequest } from "../utils/authHelper.js";
import HttpError from "../utils/httpError.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = getAuthTokenFromRequest(req);

    if (!token) {
      throw new HttpError(401, "Unauthorized");
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new HttpError(401, "Unauthorized");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
