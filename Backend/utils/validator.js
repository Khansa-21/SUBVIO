import validator from "validator";

const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;

export const normalizeString = (value, { maxLength } = {}) => {
  if (value === undefined || value === null) {
    return "";
  }

  const normalized = String(value).replace(CONTROL_CHARS_REGEX, "").trim();
  return maxLength ? normalized.slice(0, maxLength) : normalized;
};

export const normalizeEmail = (email) => {
  return (
    validator.normalizeEmail(normalizeString(email, { maxLength: 254 })) || ""
  );
};

export const normalizeEnum = (value, { lowerCase = true } = {}) => {
  const normalized = normalizeString(value);
  return lowerCase ? normalized.toLowerCase() : normalized.toUpperCase();
};

export const escapeRegex = (value) => {
  return normalizeString(value, { maxLength: 100 }).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
};

export const normalizeObjectId = (value, field = "id") => {
  const normalized = normalizeString(value);

  if (!validator.isMongoId(normalized)) {
    const error = new Error(`Invalid ${field}`);
    error.statusCode = 400;
    throw error;
  }

  return normalized;
};

export const pickAllowedFields = (source, allowedFields) => {
  const safeSource = source && typeof source === "object" ? source : {};

  return allowedFields.reduce((picked, field) => {
    if (safeSource[field] !== undefined) {
      picked[field] = safeSource[field];
    }

    return picked;
  }, {});
};

export const ensureOnlyAllowedFields = (source, allowedFields) => {
  const safeSource = source && typeof source === "object" ? source : {};
  const invalidFields = Object.keys(safeSource).filter(
    (field) => !allowedFields.includes(field),
  );

  if (invalidFields.length) {
    const error = new Error(`Fields not allowed: ${invalidFields.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }
};

export const validateSignup = (name, email, password) => {
  const errors = [];

  if (!name || normalizeString(name).length < 3) {
    errors.push("Name must be at least 3 characters");
  }

  if (!email || !validator.isEmail(email)) {
    errors.push("Please enter a valid email address");
  }

  if (!password || !validator.isStrongPassword(password)) {
    errors.push(
      "Password must be at least 8 characters with uppercase, lowercase, number & symbol",
    );
  }

  return {
    isValid: errors.length === 0,
    errors: errors.join(", "),
  };
};

export const validatePassword = (password) => {
  const errors = [];

  if (!password || !validator.isStrongPassword(password)) {
    errors.push(
      "Password must be at least 8 characters with uppercase, lowercase, number & symbol",
    );
  }

  return {
    isValid: errors.length === 0,
    errors: errors.join(", "),
  };
};

export const validateLogin = (email, password) => {
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push("Please enter a valid email address");
  }

  if (!password || password.length < 1) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.join(", "),
  };
};
