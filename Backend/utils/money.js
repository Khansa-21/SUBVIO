export const monthlyValue = (subscription) => {
  switch (subscription.frequency) {
    case "daily":
      return subscription.price * 30;
    case "weekly":
      return (subscription.price * 52) / 12;
    case "monthly":
      return subscription.price;
    case "yearly":
      return subscription.price / 12;
    default:
      return 0;
  }
};

export const roundMoney = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
