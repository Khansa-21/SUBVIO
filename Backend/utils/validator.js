import validator from "validator";

export const validateSignup = (name, email, password) => {
  const errors = [];

  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push("Please enter a valid email address");
  }

  // Password validation
  if (!password || !validator.isStrongPassword(password)) {
    errors.push(
      "Password must be at least 8 characters with uppercase, lowercase, number & symbol"
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
