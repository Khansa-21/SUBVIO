// config/sendgrid.js
import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "./env.js";

// Check if API key exists
if (!SENDGRID_API_KEY) {
  console.warn(
    "⚠️  WARNING: SENDGRID_API_KEY not found in environment variables",
  );
  console.warn(
    "⚠️  Email functionality will not work until you add it to .env",
  );
}

// Set API key
sgMail.setApiKey(SENDGRID_API_KEY);

export default sgMail;
