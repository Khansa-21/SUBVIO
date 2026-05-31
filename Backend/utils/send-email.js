import dayjs from "dayjs";
import {
  emailTemplates,
  welcomeEmailTemplate,
  resetPasswordTemplate,
  confirmationTemplate,
} from "./email-template.js";
import sgMail, { isEmailConfigured } from "../config/sendgrid.js";
import {
  FRONTEND_URL,
  SENDGRID_FROM_EMAIL,
  SENDGRID_FROM_NAME,
} from "../config/env.js";

const APP_URL = FRONTEND_URL || "http://localhost:3000";
const FROM_EMAIL = `${SENDGRID_FROM_NAME || "Subvio"} <${SENDGRID_FROM_EMAIL}>`;

const ensureEmailConfigured = () => {
  if (!isEmailConfigured || !SENDGRID_FROM_EMAIL) {
    throw new Error("SendGrid API key or sender email is missing");
  }
};

const sendMail = async (msg) => {
  ensureEmailConfigured();
  await sgMail.send({ ...msg, from: FROM_EMAIL });
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
    console.error(`Reminder email failed: ${error.message}`);
    if (error.response) console.error("SendGrid Error:", error.response.body);
    return { success: false, error: error.message };
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
      supportEmail: SENDGRID_FROM_EMAIL,
    });

    await sendMail({
      to,
      subject: `Confirmation: ${subscription.name} Subscription Activated`,
      html,
    });

    console.log(`Confirmation email sent for ${subscription.name} to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Confirmation email failed: ${error.message}`);
    if (error.response) console.error("SendGrid Error:", error.response.body);
    return { success: false, error: error.message };
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
    console.error(`Welcome email failed: ${error.message}`);
    if (error.response) console.error("SendGrid Error:", error.response.body);
    return { success: false, error: error.message };
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
    console.error(`Password reset email failed: ${error.message}`);
    if (error.response) console.error("SendGrid Error:", error.response.body);
    return { success: false, error: error.message };
  }
};
