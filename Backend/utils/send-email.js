// utils/send-email.js
import dayjs from "dayjs";
import {
  emailTemplates,
  welcomeEmailTemplate,
  resetPasswordTemplate,
  confirmationTemplate,
} from "./email-template.js";
import sgMail from "../config/sendgrid.js";
import {
  FRONTEND_URL,
  SENDGRID_FROM_EMAIL,
  SENDGRID_FROM_NAME,
} from "../config/env.js";

// Default sender email
const FROM_EMAIL = `${SENDGRID_FROM_NAME || "Subvio"} <${SENDGRID_FROM_EMAIL}>`;

// Send REMINDER emails (10, 7, 5, 3, 2, 1 days before renewal)
export const sendReminderEmail = async ({ to, type, subscription }) => {
  try {
    // 1. Validate inputs
    if (!to || !type || !subscription) {
      throw new Error("Missing required parameters: to, type, or subscription");
    }

    // 2. Find template
    const template = emailTemplates.find((t) => t.label === type);
    if (!template) {
      throw new Error(`Invalid email type: ${type}`);
    }

    // 3. Prepare email data
    const mailInfo = {
      userName: subscription.user?.name || "User",
      subscriptionName: subscription.name,
      renewalDate: dayjs(subscription.renewalDate).format("MMM D, YYYY"),
      planName: subscription.name,
      price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
      paymentMethod: subscription.paymentMethod || "Credit Card",
      accountSettingsLink: "#",
      supportLink: "#",
    };

    // 4. Get subject and body
    const subject = template.generateSubject(mailInfo);
    const html = template.generateBody(mailInfo);

    // 5. Send email using SendGrid
    const msg = {
      to: to,
      from: FROM_EMAIL,
      subject: subject,
      html: html,
    };

    await sgMail.send(msg);

    console.log(`✅ Email sent to ${to} for ${subscription.name}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email failed: ${error.message}`);
    if (error.response) {
      console.error("SendGrid Error:", error.response.body);
    }
    return { success: false, error: error.message };
  }
};

// Send SUBSCRIPTION CONFIRMATION email
export const sendSubscriptionConfirmation = async ({
  to,
  subscription,
  userName,
}) => {
  try {
    if (!to || !subscription) {
      throw new Error("Missing email parameters");
    }

    const templateData = {
      userName: userName,
      subscriptionName: subscription.name,
      subscriptionDate: dayjs(subscription.startDate).format("MMM D, YYYY"),
      renewalDate: dayjs(subscription.renewalDate).format("MMM D, YYYY"),
      price: `${subscription.currency} ${subscription.price}`,
      frequency: subscription.frequency,
      paymentMethod: subscription.paymentMethod || "Credit Card",
      frontendUrl: FRONTEND_URL,
    };

    const html = confirmationTemplate(templateData);

    // Send email using SendGrid
    const msg = {
      to: to,
      from: FROM_EMAIL,
      subject: `✅ Confirmation: ${subscription.name} Subscription Activated`,
      html: html,
    };

    await sgMail.send(msg);

    console.log(`📧 Confirmation email sent for ${subscription.name} to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Confirmation email failed: ${error.message}`);
    if (error.response) {
      console.error("SendGrid Error:", error.response.body);
    }
    return { success: false, error: error.message };
  }
};

// Send WELCOME email
export const sendWelcomeEmail = async (to, userName) => {
  try {
    const html = welcomeEmailTemplate(
      userName,
      FRONTEND_URL || "http://localhost:3000",
    );

    // Send email using SendGrid
    const msg = {
      to: to,
      from: FROM_EMAIL,
      subject: `👋 Welcome to Subvio, ${userName}!`,
      html: html,
    };

    await sgMail.send(msg);

    console.log(`✅ Welcome email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Welcome email failed: ${error.message}`);
    if (error.response) {
      console.error("SendGrid Error:", error.response.body);
    }
    return { success: false, error: error.message };
  }
};

  // Send PASSWORD RESET email
  export const sendPasswordResetEmail = async (to, userName, resetLink) => {
    try {
      const html = resetPasswordTemplate(userName, resetLink);

      // Send email using SendGrid
      const msg = {
        to: to,
        from: FROM_EMAIL,
        subject: "🔐 Password Reset Request - Subvio",
        html: html,
      };

      await sgMail.send(msg);

      console.log(`✅ Password reset email sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Password reset email failed: ${error.message}`);
      if (error.response) {
        console.error("SendGrid Error:", error.response.body);
      }
      return { success: false, error: error.message };
    }
  };
