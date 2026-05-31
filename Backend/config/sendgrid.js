import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "./env.js";

export const isEmailConfigured = Boolean(SENDGRID_API_KEY);

if (isEmailConfigured) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY not found - email sending is disabled");
}

export default sgMail;
