import HttpError from "./httpError.js";
import {
  normalizeEnum,
  normalizeDate,
  normalizeNumber,
  normalizeString,
  pickAllowedFields,
} from "./validator.js";

export const subscriptionFields = [
  "name",
  "price",
  "currency",
  "frequency",
  "category",
  "paymentMethod",
  "status",
  "startDate",
  "renewalDate",
];

export const buildSubscriptionPayload = (source) => {
  const payload = pickAllowedFields(source, subscriptionFields);

  if (payload.name !== undefined) {
    payload.name = normalizeString(payload.name, { maxLength: 100 });
  }

  if (payload.price !== undefined) {
    payload.price = normalizeNumber(payload.price, "price");
  }

  if (payload.currency !== undefined) {
    payload.currency = normalizeEnum(payload.currency, {
      lowerCase: false,
    });
  }

  if (payload.frequency !== undefined) {
    payload.frequency = normalizeEnum(payload.frequency);
  }

  if (payload.category !== undefined) {
    payload.category = normalizeEnum(payload.category);
  }

  if (payload.paymentMethod !== undefined) {
    payload.paymentMethod = normalizeString(payload.paymentMethod, {
      maxLength: 100,
    });
  }

  if (payload.status !== undefined) {
    payload.status = normalizeEnum(payload.status);
  }

  if (payload.startDate !== undefined) {
    payload.startDate = normalizeDate(payload.startDate, "startDate");
  }

  if (payload.renewalDate !== undefined) {
    payload.renewalDate = normalizeDate(payload.renewalDate, "renewalDate");
  }

  return payload;
};

export const ensurePositivePrice = (price) => {
  if (price !== undefined && (!Number.isFinite(Number(price)) || price <= 0)) {
    throw new HttpError(400, "Price must be greater than 0");
  }
};
