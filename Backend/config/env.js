import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  DNS_SERVERS,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ARCJET_KEY,
  ARCJET_ENV,
  QSTASH_URL,
  QSTASH_TOKEN,
  SERVER_URL,
  STRIPE_SECRET_KEY,
  FRONTEND_URL,
  BREVO_API_KEY,
  BREVO_FROM_EMAIL,
  BREVO_FROM_NAME,
} = process.env;

// export const isDevelopment = process.env.NODE_ENV === "development";
