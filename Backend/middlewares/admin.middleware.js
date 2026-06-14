import HttpError from "../utils/httpError.js";

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(new HttpError(403, "Access denied: Admins only"));
  }

  return next();
}

export default requireAdmin;
