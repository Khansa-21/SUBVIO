import { BREVO_API_KEY } from "./env.js";
import validator from "validator";
import HttpError from "../utils/httpError.js";

const BREVO_EMAIL_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_FETCH_TIMEOUT_MS = 10000;

export const isEmailConfigured = Boolean(BREVO_API_KEY);

if (!isEmailConfigured) {
  console.warn("BREVO_API_KEY not found - email sending is disabled");
}

export const sendBrevoEmail = async ({ sender, to, subject, htmlContent }) => {
  if (!isEmailConfigured) {
    throw new HttpError(503, "Brevo API key is missing");
  }

  if (typeof fetch !== "function") {
    throw new HttpError(500, "Brevo email sending requires Node.js 18+");
  }

  const safeSender = normalizeEmailContact(sender, "sender");
  const recipients = normalizeRecipients(to);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BREVO_FETCH_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(BREVO_EMAIL_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: safeSender,
        to: recipients,
        subject,
        htmlContent,
      }),
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new HttpError(504, "Brevo email request timed out");
    }

    throw new HttpError(502, "Brevo email request failed", error.message);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let responseBody = null;

    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text();
    }

    const error = new HttpError(
      response.status,
      `Brevo API error (${response.status} ${response.statusText})`,
    );
    error.responseBody = responseBody;
    throw error;
  }
};

const normalizeEmailContact = (contact, field) => {
  const email =
    typeof contact === "string"
      ? contact.trim()
      : String(contact?.email || "").trim();
  const name =
    typeof contact === "object" && contact?.name
      ? String(contact.name).trim()
      : undefined;

  if (!validator.isEmail(email)) {
    throw new HttpError(400, `Invalid ${field} email`);
  }

  return name ? { email, name } : { email };
};

const normalizeRecipients = (to) => {
  const recipients = Array.isArray(to) ? to : [to];

  if (!recipients.length) {
    throw new HttpError(400, "At least one recipient email is required");
  }

  return recipients.map((recipient) =>
    normalizeEmailContact(recipient, "recipient"),
  );
};
