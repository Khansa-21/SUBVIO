// automated reminder system

import dayjs from "dayjs";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");

import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

// use in loop
const REMINDERS = [10, 7, 5, 3, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  // if there is no subscription
  // Exist out of the function
  if (!subscription || subscription.status !== "active") {
    await context.run("log-no-subscription", () => {
      console.log(`No active subscription found for ${subscriptionId}`);
    });
    return;
  }

  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(dayjs())) {
    //  dayjs() returns current date and time

    await context.run("log-expired", () => {
      console.log(
        `Renewal Date has passed for Subscription ${subscriptionId}. Stopping workflow`
      );
    });

    // Exit out of this workflow

    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    // Only sleep if reminder date is in the future
    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `Reminder ${daysBefore} days before`,
        reminderDate
      );
    }

    if (dayjs().isSame(reminderDate, "day")) {
      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription
      );
    }

    // await triggerReminder(
    //   context,
    //   `${daysBefore} days before reminder`,
    //   subscription
    // );
  }
});

// modular helpers

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });
};

const sleepUntilReminder = async (context, label, date) => {
  await context.run(label, () => {
    console.log(`Sleepiny until ${label} remainder at ${date}`);
  });
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);
    // Send email, SMS, push notification...

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};
