import ImportCandidate from "../models/importCandidate.model.js";
import Subscription from "../models/subscription.model.js";
import HttpError from "../utils/httpError.js";
import {
  buildSubscriptionPayload,
  ensurePositivePrice,
  subscriptionFields,
  userHasSubscriptionNamed,
} from "./subscription.service.js";

const MAX_IMPORT_ITEMS = 50;

const allowedValues = (field) => Subscription.schema.path(field).enumValues;
const ALLOWED_CURRENCIES = allowedValues("currency");
const ALLOWED_FREQUENCIES = allowedValues("frequency");
const ALLOWED_CATEGORIES = allowedValues("category");
const ALLOWED_STATUSES = allowedValues("status");

const FIELD_ALIASES = {
  platform: "name",
  service: "name",
  amount: "price",
  cost: "price",
  billing: "frequency",
  method: "paymentMethod",
  payment: "paymentMethod",
  start: "startDate",
  renewal: "renewalDate",
};

const normalizeHeader = (value) => {
  const key = String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[-_]/g, "")
    .toLowerCase();

  const known = {
    name: "name",
    price: "price",
    currency: "currency",
    frequency: "frequency",
    category: "category",
    paymentmethod: "paymentMethod",
    status: "status",
    startdate: "startDate",
    renewaldate: "renewalDate",
  };

  return known[key] || FIELD_ALIASES[key] || value;
};

const splitLine = (line) =>
  String(line)
    .split(/[,\t|]/)
    .map((part) => part.trim())
    .filter(Boolean);

const isHeaderRow = (parts) => {
  const normalized = parts.map(normalizeHeader);
  return normalized.some((field) => subscriptionFields.includes(field));
};

const objectFromParts = (parts, headers) => {
  const defaultOrder = [
    "name",
    "price",
    "frequency",
    "category",
    "paymentMethod",
    "startDate",
    "renewalDate",
    "currency",
  ];
  const fields = headers?.length ? headers : defaultOrder;

  return parts.reduce((item, value, index) => {
    const field = normalizeHeader(fields[index]);
    if (subscriptionFields.includes(field)) {
      item[field] = value;
    }
    return item;
  }, {});
};

const normalizeImportItem = (item) => {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    return {
      raw: item,
      rawSource: JSON.stringify(item),
    };
  }

  const parts = splitLine(item);
  return {
    raw: objectFromParts(parts),
    rawSource: String(item || ""),
  };
};

export const parseImportInput = ({ text, items, candidates }) => {
  if (Array.isArray(items) || Array.isArray(candidates)) {
    return (items || candidates).map(normalizeImportItem);
  }

  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new HttpError(400, "Provide import text or an items array");
  }

  let headers = null;
  return lines
    .map(splitLine)
    .filter((parts) => parts.length)
    .reduce((rows, parts, index) => {
      if (index === 0 && isHeaderRow(parts)) {
        headers = parts.map(normalizeHeader);
        return rows;
      }

      rows.push({
        raw: objectFromParts(parts, headers),
        rawSource: parts.join(", "),
      });
      return rows;
    }, []);
};

const safeBuildPayload = (source) => {
  const payload = {};
  const issues = [];
  const withDefaults = {
    currency: "USD",
    paymentMethod: "Imported",
    status: "active",
    startDate: new Date(),
    ...source,
  };

  subscriptionFields.forEach((field) => {
    if (withDefaults[field] === undefined || withDefaults[field] === "") {
      return;
    }

    try {
      const normalized = buildSubscriptionPayload({
        [field]: withDefaults[field],
      });
      if (normalized[field] !== undefined) {
        payload[field] = normalized[field];
      }
    } catch (error) {
      issues.push(error.message);
    }
  });

  return { payload, issues };
};

const validateCandidatePayload = (payload) => {
  const issues = [];

  if (!payload.name || payload.name.length < 3) {
    issues.push("Name must be at least 3 characters");
  }

  try {
    ensurePositivePrice(payload.price);
  } catch (error) {
    issues.push(error.message);
  }

  if (payload.price === undefined) {
    issues.push("Price is required");
  }

  if (!ALLOWED_CURRENCIES.includes(payload.currency)) {
    issues.push(`Currency must be one of: ${ALLOWED_CURRENCIES.join(", ")}`);
  }

  if (!ALLOWED_FREQUENCIES.includes(payload.frequency)) {
    issues.push(`Frequency must be one of: ${ALLOWED_FREQUENCIES.join(", ")}`);
  }

  if (!ALLOWED_CATEGORIES.includes(payload.category)) {
    issues.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`);
  }

  if (!ALLOWED_STATUSES.includes(payload.status)) {
    issues.push(`Status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
  }

  if (!payload.paymentMethod) {
    issues.push("Payment method is required");
  }

  if (!payload.startDate) {
    issues.push("Start date is required");
  }

  if (
    payload.renewalDate &&
    payload.startDate &&
    payload.renewalDate <= payload.startDate
  ) {
    issues.push("Renewal date must be after the start date");
  }

  return issues;
};

export const buildImportCandidate = async ({ raw, rawSource, userId }) => {
  const { payload, issues } = safeBuildPayload(raw);
  const validationIssues = validateCandidatePayload(payload);
  const duplicate = payload.name
    ? await userHasSubscriptionNamed(userId, payload.name)
    : false;

  if (duplicate) {
    validationIssues.push("Subscription already exists for this user");
  }

  return {
    user: userId,
    payload,
    rawSource,
    issues: [...new Set([...issues, ...validationIssues])],
    duplicate,
  };
};

export const createImportCandidates = async ({ input, userId }) => {
  const rows = parseImportInput(input);

  if (!rows.length) {
    throw new HttpError(400, "No import candidates found");
  }

  if (rows.length > MAX_IMPORT_ITEMS) {
    throw new HttpError(400, `Import up to ${MAX_IMPORT_ITEMS} items at a time`);
  }

  const candidates = await Promise.all(
    rows.map((row) => buildImportCandidate({ ...row, userId })),
  );

  return ImportCandidate.insertMany(candidates);
};

export const getImportCandidates = ({ userId, status = "pending" }) => {
  const query = { user: userId };

  if (status) {
    query.importStatus = status;
  }

  return ImportCandidate.find(query).sort({ createdAt: -1 });
};

export const updateImportCandidate = async ({
  candidateId,
  userId,
  updates,
}) => {
  const candidate = await ImportCandidate.findOne({
    _id: candidateId,
    user: userId,
    importStatus: "pending",
  });

  if (!candidate) {
    throw new HttpError(404, "Import candidate not found");
  }

  const merged = {
    ...(candidate.payload?.toObject
      ? candidate.payload.toObject()
      : candidate.payload),
    ...updates,
  };
  const rebuilt = await buildImportCandidate({
    raw: merged,
    rawSource: candidate.rawSource,
    userId,
  });

  candidate.payload = rebuilt.payload;
  candidate.issues = rebuilt.issues;
  candidate.duplicate = rebuilt.duplicate;

  return candidate.save();
};

export const confirmImportCandidate = async ({ candidateId, userId }) => {
  const candidate = await ImportCandidate.findOne({
    _id: candidateId,
    user: userId,
    importStatus: "pending",
  });

  if (!candidate) {
    throw new HttpError(404, "Import candidate not found");
  }

  if (candidate.issues.length) {
    throw new HttpError(400, "Resolve candidate issues before confirming", {
      issues: candidate.issues,
    });
  }

  if (await userHasSubscriptionNamed(userId, candidate.payload.name)) {
    candidate.duplicate = true;
    candidate.issues = ["Subscription already exists for this user"];
    await candidate.save();
    throw new HttpError(409, "Subscription already exists for this user");
  }

  const payload = candidate.payload?.toObject
    ? candidate.payload.toObject()
    : candidate.payload;
  const subscription = await Subscription.create({
    ...payload,
    user: userId,
  });

  candidate.importStatus = "confirmed";
  candidate.confirmedSubscription = subscription._id;
  await candidate.save();

  return { candidate, subscription };
};

export const rejectImportCandidate = async ({ candidateId, userId }) => {
  const candidate = await ImportCandidate.findOne({
    _id: candidateId,
    user: userId,
    importStatus: "pending",
  });

  if (!candidate) {
    throw new HttpError(404, "Import candidate not found");
  }

  candidate.importStatus = "rejected";
  return candidate.save();
};
