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

<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f7fa;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
            <td style="background-color: #4a90e2; text-align: center;">
                <p style="font-size: 54px; line-height: 54px; font-weight: 800;">Subvio</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">                
                <p style="font-size: 16px; margin-bottom: 25px;">Hello <strong style="color: #4a90e2;">${userName}</strong>,</p>
                
                <p style="font-size: 16px; margin-bottom: 25px;">Your <strong>${subscriptionName}</strong> subscription is set to renew on <strong style="color: #4a90e2;">${renewalDate}</strong> (${daysLeft} days from today).</p>
                
                <table cellpadding="15" cellspacing="0" border="0" width="100%" style="background-color: #f0f7ff; border-radius: 10px; margin-bottom: 25px;">
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d0e3ff;">
                            <strong>Plan:</strong> ${planName}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; border-bottom: 1px solid #d0e3ff;">
                            <strong>Price:</strong> ${price}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px;">
                            <strong>Payment Method:</strong> ${paymentMethod}
                        </td>
                    </tr>
                </table>
                
                <p style="font-size: 16px; margin-bottom: 25px;">If you'd like to make changes or cancel your subscription, please visit your <a href="${accountSettingsLink}" style="color: #4a90e2; text-decoration: none;">account settings</a> before the renewal date.</p>
                
                <p style="font-size: 16px; margin-top: 30px;">Need help? <a href="${supportLink}" style="color: #4a90e2; text-decoration: none;">Contact our support team</a> anytime.</p>
                
                <p style="font-size: 16px; margin-top: 30px;">
                    Best regards,<br>
                    <strong>The Subvio Team</strong>
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f0f7ff; padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0 0 10px;">
                    Subvio | 123 Main St, Anytown, AN 12345
                </p>
                <p style="margin: 0;">
                    <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
                    <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
                    <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Terms of Service</a>
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
      `📅 Reminder: Your ${data.subscriptionName} Subscription Renews in 10 Days!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 10 }),
  },
  {
    label: "7 days before reminder",
    generateSubject: (data) =>
      `📅 Reminder: Your ${data.subscriptionName} Subscription Renews in 7 Days!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 7 }),
  },
  {
    label: "5 days before reminder",
    generateSubject: (data) =>
      `⏳ ${data.subscriptionName} Renews in 5 Days – Stay Subscribed!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 5 }),
  },
  {
    label: "3 days before reminder",
    generateSubject: (data) =>
      `⏲ ${data.subscriptionName} Renews in 3 Days, Hurry up to Stay Subscribed!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 5 }),
  },
  {
    label: "2 days before reminder",
    generateSubject: (data) =>
      `🚀 2 Days Left!  ${data.subscriptionName} Subscription Renewal`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 2 }),
  },
  {
    label: "1 day before reminder",
    generateSubject: (data) =>
      `🎇 Final Reminder: ${data.subscriptionName} Renews Tomorrow!`,
    generateBody: (data) => generateEmailTemplate({ ...data, daysLeft: 1 }),
  },
  // {
  //   label: "Final day reminder",
  //   generateSubject: (data) =>
  //     `⚡ Final Reminder: ${data.subscriptionName} Renews Today!`,
  //   generateBody: (data) => generateEmailTemplate({ ...data }),
  // },
];

export const welcomeEmailTemplate = (userName, frontendUrl) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2>Welcome to Subvio, ${userName}! 👋</h2>
  <p>Thank you for joining our platform. We're excited to help you manage your subscriptions efficiently.</p>
  
  <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3>Getting Started:</h3>
    <ul>
      <li>📅 Add your subscriptions with renewal dates</li> <br>
      <li>💰 Track monthly spending</li> <br>
      <li>⏰ Get automatic renewal reminders</li> <br>
      <li>📊 View spending analytics</li> <br>
    </ul>
  </div>
  
  <a href="${frontendUrl}/dashboard" 
     style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
    Go to Dashboard
  </a>
  
  <p style="margin-top: 30px; color: #666; font-size: 14px;">
    Need help? Contact us anytime.<br>
    Happy Tracking!<br>
    <strong>The Subvio Team</strong>
  </p>
</div>
`;

export const resetPasswordTemplate = (userName, resetLink) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Password Reset Request</h2>
  <p>Hello ${userName},</p>
  <p>You requested to reset your password for Subvio.</p>
  <p>Click the button below to reset your password:</p>
  <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">
    Reset Password
  </a>
  <p>This link will expire in 15 minutes.</p>
  <p>If you didn't request this, please ignore this email.</p>
  <hr>
  <p style="color: #666; font-size: 12px;">
    Subvio Team<br>
    <a href="#">Visit our website</a>
  </p>
</div>
`;
// Subscription Confirmation Template
export const confirmationTemplate = ({
  userName,
  subscriptionName,
  subscriptionDate,
  renewalDate,
  price,
  frequency,
  paymentMethod,
  frontendUrl
}) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4a90e2; text-align: center; padding: 40px 0;">
    <p style="font-size: 54px; line-height: 54px; font-weight: 800; color: white; margin: 0;">Subvio</p>
  </div>
  
  <div style="padding: 40px 30px; background: white;">
    <h2 style="color: #333; margin-bottom: 20px;">🎉 Subscription Confirmed!</h2>
    
    <p style="font-size: 16px; margin-bottom: 25px;">
      Hello <strong style="color: #4a90e2;">${userName}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 25px;">
      You have successfully subscribed to <strong>${subscriptionName}</strong>.
      Your subscription details are below:
    </p>
    
    <div style="background-color: #f0f7ff; border-radius: 10px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #4a90e2; margin-top: 0;">Subscription Details</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #d0e3ff; width: 40%;">
            <strong>Subscription:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #d0e3ff;">
            ${subscriptionName}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #d0e3ff;">
            <strong>Price:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #d0e3ff;">
            ${price} / ${frequency}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #d0e3ff;">
            <strong>Subscription Date:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #d0e3ff;">
            ${subscriptionDate}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #d0e3ff;">
            <strong>Next Renewal:</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #d0e3ff;">
            ${renewalDate}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0;">
            <strong>Payment Method:</strong>
          </td>
          <td style="padding: 10px 0;">
            ${paymentMethod}
          </td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 25px;">
      You will receive reminder emails before each renewal date.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${frontendUrl}/dashboard" 
         style="background: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        View in Dashboard
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Need help? <a href="mailto:support@subvio.com" style="color: #4a90e2;">Contact Support</a>
    </p>
  </div>
  
  <div style="background-color: #f0f7ff; padding: 20px; text-align: center; font-size: 14px; color: #666;">
    <p style="margin: 0 0 10px;">Subvio | Subscription Management System</p>
    <p style="margin: 0;">
      <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
      <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Terms of Service</a>
    </p>
  </div>
</div>
`;