import { BREVO_API_KEY } from "./env.js";

const BREVO_EMAIL_API_URL = "https://api.brevo.com/v3/smtp/email";

export const isEmailConfigured = Boolean(BREVO_API_KEY);

if (!isEmailConfigured) {
  console.warn("BREVO_API_KEY not found - email sending is disabled");
}

export const sendBrevoEmail = async ({ sender, to, subject, htmlContent }) => {
  if (!isEmailConfigured) {
    throw new Error("Brevo API key is missing");
  }

  if (typeof fetch !== "function") {
    throw new Error("Brevo email sending requires Node.js 18+");
  }

  const recipients = Array.isArray(to) ? to : [{ email: to }];

  const response = await fetch(BREVO_EMAIL_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: recipients,
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    let responseBody = null;

    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text();
    }

    const error = new Error(
      `Brevo API error (${response.status} ${response.statusText})`,
    );
    error.responseBody = responseBody;
    throw error;
  }
};
