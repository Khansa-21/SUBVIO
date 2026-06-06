import dayjs from "dayjs";
import {
  emailTemplates,
  welcomeEmailTemplate,
  resetPasswordTemplate,
  confirmationTemplate,
} from "./email-template.js";
import { sendBrevoEmail, isEmailConfigured } from "../config/brevo.js";
import {
  FRONTEND_URL,
  BREVO_FROM_EMAIL,
  BREVO_FROM_NAME,
} from "../config/env.js";

const APP_URL = FRONTEND_URL || "http://localhost:3000";
const FROM_EMAIL = {
  email: BREVO_FROM_EMAIL,
  name: BREVO_FROM_NAME || "Subvio",
};

const ensureEmailConfigured = () => {
  if (!isEmailConfigured || !BREVO_FROM_EMAIL) {
    throw new Error("Brevo API key or sender email is missing");
  }
};

const getEmailErrorMessage = (error) => {
  const brevoError = error.responseBody;
  if (brevoError && typeof brevoError === "object") {
    const details = [brevoError.code, brevoError.message]
      .filter(Boolean)
      .join(": ");

    if (details) {
      return `${error.message}: ${details}`;
    }
  }

  return error.message;
};

const sendMail = async (msg) => {
  ensureEmailConfigured();
  await sendBrevoEmail({
    sender: FROM_EMAIL,
    to: msg.to,
    subject: msg.subject,
    htmlContent: msg.html,
  });
};

export const sendReminderEmail = async ({ to, type, subscription }) => {
  try {
    if (!to || !type || !subscription) {
      throw new Error("Missing required parameters: to, type, or subscription");
    }

    const template = emailTemplates.find((t) => t.label === type);
    if (!template) {
      throw new Error(`Invalid email type: ${type}`);
    }

    const mailInfo = {
      userName: subscription.user?.name || "User",
      subscriptionName: subscription.name,
      renewalDate: dayjs(subscription.renewalDate).format("MMM D, YYYY"),
      planName: subscription.name,
      price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
      paymentMethod: subscription.paymentMethod || "Credit Card",
      accountSettingsLink: `${APP_URL}/settings`,
      supportLink: `${APP_URL}/support`,
    };

    await sendMail({
      to,
      subject: template.generateSubject(mailInfo),
      html: template.generateBody(mailInfo),
    });

    console.log(`Reminder email sent to ${to} for ${subscription.name}`);
    return { success: true };
  } catch (error) {
    const errorMessage = getEmailErrorMessage(error);
    console.error(`Reminder email failed: ${errorMessage}`);
    if (error.responseBody) console.error("Brevo Error:", error.responseBody);
    return { success: false, error: errorMessage };
  }
};

export const sendSubscriptionConfirmation = async ({
  to,
  subscription,
  userName,
}) => {
  try {
    if (!to || !subscription) {
      throw new Error("Missing email parameters");
    }

    const html = confirmationTemplate({
      userName,
      subscriptionName: subscription.name,
      subscriptionDate: dayjs(subscription.startDate).format("MMM D, YYYY"),
      renewalDate: dayjs(subscription.renewalDate).format("MMM D, YYYY"),
      price: `${subscription.currency} ${subscription.price}`,
      frequency: subscription.frequency,
      paymentMethod: subscription.paymentMethod || "Credit Card",
      frontendUrl: APP_URL,
      supportEmail: BREVO_FROM_EMAIL,
    });

    await sendMail({
      to,
      subject: `Confirmation: ${subscription.name} Subscription Activated`,
      html,
    });

    console.log(`Confirmation email sent for ${subscription.name} to ${to}`);
    return { success: true };
  } catch (error) {
    const errorMessage = getEmailErrorMessage(error);
    console.error(`Confirmation email failed: ${errorMessage}`);
    if (error.responseBody) console.error("Brevo Error:", error.responseBody);
    return { success: false, error: errorMessage };
  }
};

export const sendWelcomeEmail = async (to, userName) => {
  try {
    const html = welcomeEmailTemplate(userName, APP_URL);

    await sendMail({
      to,
      subject: `Welcome to Subvio, ${userName}!`,
      html,
    });

    console.log(`Welcome email sent to ${to}`);
    return { success: true };
  } catch (error) {
    const errorMessage = getEmailErrorMessage(error);
    console.error(`Welcome email failed: ${errorMessage}`);
    if (error.responseBody) console.error("Brevo Error:", error.responseBody);
    return { success: false, error: errorMessage };
  }
};

export const sendPasswordResetEmail = async (to, userName, resetLink) => {
  try {
    const html = resetPasswordTemplate(userName, resetLink, APP_URL);

    await sendMail({
      to,
      subject: "Password Reset Request - Subvio",
      html,
    });

    console.log(`Password reset email sent to ${to}`);
    return { success: true };
  } catch (error) {
    const errorMessage = getEmailErrorMessage(error);
    console.error(`Password reset email failed: ${errorMessage}`);
    if (error.responseBody) console.error("Brevo Error:", error.responseBody);
    return { success: false, error: errorMessage };
  }
};
