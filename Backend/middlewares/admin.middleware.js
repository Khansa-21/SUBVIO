export function requireAdmin(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      const error = new Error("Access denied: Admins only");
      error.statusCode = 403;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  }
}

export default requireAdmin;
