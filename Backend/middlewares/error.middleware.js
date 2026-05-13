const errorMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  } // debugging ke liye

  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  // MongoDB bad ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found, Invalid ${err.path}: ${err.value}`;
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for field: ${Object.keys(err.keyValue).join(
      ","
    )}`;
  }

  // MongoDB validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(",");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Unauthorized, Invalid token, please log in again";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired, please log in again";
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorMiddleware;
