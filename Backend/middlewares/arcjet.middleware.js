import aj from "../config/arcjet.js";
import HttpError from "../utils/httpError.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    if (!aj) {
      return next();
    }

    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new HttpError(429, "Rate limit exceeded");
      }

      if (decision.reason.isBot()) {
        throw new HttpError(403, "Bot detected");
      }

      throw new HttpError(403, "Access denied");
    }
    next();
  } catch (error) {
    console.log(`Arcjet Middleware Error: ${error}`);
    next(error);
  }
};

export default arcjetMiddleware;
