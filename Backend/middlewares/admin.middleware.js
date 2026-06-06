import HttpError from "../utils/httpError.js";

export function requireAdmin(req, res, next) {
  try {
    if (req.user?.role !== "admin") {
      throw new HttpError(403, "Access denied: Admins only");
    }

    next();
  } catch (error) {
    next(error);
  }
}

export default requireAdmin;
