export const generateEmailTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  planName,
  price,
  paymentMethod,
  accountSettingsLink,
  supportLink,
  daysLeft,
}) => `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #f4f7fa;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
    <tr>
      <td style="background-color: #4a90e2; text-align: center; padding: 24px;">
        <p style="font-size: 42px; line-height: 42px; font-weight: 800; color: #ffffff; margin: 0;">Subvio</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 24px;">
        <p>Hello <strong style="color: #4a90e2;">${userName}</strong>,</p>
        <p>Your <strong>${subscriptionName}</strong> subscription renews on <strong style="color: #4a90e2;">${renewalDate}</strong> (${daysLeft} days from today).</p>

        <table cellpadding="12" cellspacing="0" border="0" width="100%" style="background-color: #f0f7ff; border-radius: 8px; margin: 20px 0;">
          <tr>
            <td style="border-bottom: 1px solid #d0e3ff;"><strong>Plan:</strong> ${planName}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #d0e3ff;"><strong>Price:</strong> ${price}</td>
          </tr>
          <tr>
            <td><strong>Payment Method:</strong> ${paymentMethod}</td>
          </tr>
        </table>

        <p>You can update or cancel your subscription from <a href="${accountSettingsLink}" style="color: #4a90e2;">account settings</a>.</p>
        <p>Need help? <a href="${supportLink}" style="color: #4a90e2;">Contact support</a>.</p>
        <p>Best regards,<br><strong>The Subvio Team</strong></p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f0f7ff; padding: 16px; text-align: center; font-size: 14px;">
        <p style="margin: 0 0 8px;">Subvio | Subscription Management System</p>
        <p style="margin: 0;">
          <a href="${accountSettingsLink}" style="color: #4a90e2; text-decoration: none; margin: 0 8px;">Manage emails</a> |
          <a href="${supportLink}" style="color: #4a90e2; text-decoration: none; margin: 0 8px;">Support</a>
        </p>
      </td>
    </tr>
  </table>
</div>
`;

export const emailTemplates = [
  {
    label: "10 days before reminder",
    generateSubject: (data) =>
      `Reminder: Your ${data.subscriptionName} subscription renews in 10 days`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 10 }),
  },
  {
    label: "7 days before reminder",
    generateSubject: (data) =>
      `Reminder: Your ${data.subscriptionName} subscription renews in 7 days`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 7 }),
  },
  {
    label: "5 days before reminder",
    generateSubject: (data) =>
      `Reminder: Your ${data.subscriptionName} subscription renews in 5 days`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 5 }),
  },
  {
    label: "3 days before reminder",
    generateSubject: (data) =>
      `Reminder: Your ${data.subscriptionName} subscription renews in 3 days`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 3 }),
  },
  {
    label: "2 days before reminder",
    generateSubject: (data) =>
      `Reminder: Your ${data.subscriptionName} subscription renews in 2 days`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 2 }),
  },
  {
    label: "1 day before reminder",
    generateSubject: (data) =>
      `Final reminder: Your ${data.subscriptionName} subscription renews tomorrow`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 1 }),
  },
];

export const welcomeEmailTemplate = (userName, frontendUrl) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Welcome to Subvio, ${userName}!</h2>
  <p>Thank you for joining Subvio. You can now track subscriptions, renewal dates, and monthly spending.</p>
  <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Getting started</h3>
    <ul>
      <li>Add active subscriptions with renewal dates</li>
      <li>Track monthly spending</li>
      <li>Receive automatic renewal reminders</li>
      <li>Review spending analytics</li>
    </ul>
  </div>
  <a href="${frontendUrl}/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
  <p style="margin-top: 30px; color: #666; font-size: 14px;">The Subvio Team</p>
</div>
`;

export const resetPasswordTemplate = (userName, resetLink, frontendUrl) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Password Reset Request</h2>
  <p>Hello ${userName},</p>
  <p>You requested to reset your password for Subvio.</p>
  <p>Click the button below to reset your password:</p>
  <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">Reset Password</a>
  <p>This link will expire in 15 minutes.</p>
  <p>If you did not request this, please ignore this email.</p>
  <hr>
  <p style="color: #666; font-size: 12px;">Subvio Team<br><a href="${frontendUrl}">Visit our website</a></p>
</div>
`;

export const confirmationTemplate = ({
  userName,
  subscriptionName,
  subscriptionDate,
  renewalDate,
  price,
  frequency,
  paymentMethod,
  frontendUrl,
  supportEmail,
}) => `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4a90e2; text-align: center; padding: 32px 0;">
    <p style="font-size: 42px; line-height: 42px; font-weight: 800; color: white; margin: 0;">Subvio</p>
  </div>
  <div style="padding: 32px 24px; background: white;">
    <h2>Subscription Confirmed</h2>
    <p>Hello <strong style="color: #4a90e2;">${userName}</strong>,</p>
    <p>You have successfully subscribed to <strong>${subscriptionName}</strong>.</p>
    <div style="background-color: #f0f7ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h3 style="color: #4a90e2; margin-top: 0;">Subscription Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0;"><strong>Subscription:</strong></td><td>${subscriptionName}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Price:</strong></td><td>${price} / ${frequency}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Subscription Date:</strong></td><td>${subscriptionDate}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Next Renewal:</strong></td><td>${renewalDate}</td></tr>
        <tr><td style="padding: 8px 0;"><strong>Payment Method:</strong></td><td>${paymentMethod}</td></tr>
      </table>
    </div>
    <p>You will receive reminder emails before each renewal date.</p>
    <p><a href="${frontendUrl}/dashboard" style="background: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Dashboard</a></p>
    <p style="font-size: 14px; color: #666;">Need help? <a href="mailto:${supportEmail}" style="color: #4a90e2;">Contact support</a></p>
  </div>
  <div style="background-color: #f0f7ff; padding: 16px; text-align: center; font-size: 14px; color: #666;">
    <p style="margin: 0 0 8px;">Subvio | Subscription Management System</p>
    <p style="margin: 0;">
      <a href="${frontendUrl}/privacy" style="color: #4a90e2; text-decoration: none; margin: 0 8px;">Privacy Policy</a> |
      <a href="${frontendUrl}/terms" style="color: #4a90e2; text-decoration: none; margin: 0 8px;">Terms of Service</a>
    </p>
  </div>
</div>
`;
