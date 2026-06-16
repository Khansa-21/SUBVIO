import {
  confirmImportCandidate,
  createImportCandidates,
  getImportCandidates,
  rejectImportCandidate,
  updateImportCandidate,
} from "../services/smart-import.service.js";
import { subscriptionFields } from "../services/subscription.service.js";
import {
  ensureOnlyAllowedFields,
  normalizeEnum,
  normalizeObjectId,
} from "../utils/validator.js";

export const createSmartImportCandidates = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, ["text", "items", "candidates"]);

    const candidates = await createImportCandidates({
      input: req.body,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

export const listSmartImportCandidates = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.query, ["status"]);
    const status = req.query.status ? normalizeEnum(req.query.status) : "pending";
    const candidates = await getImportCandidates({
      userId: req.user._id,
      status,
    });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

export const editSmartImportCandidate = async (req, res, next) => {
  try {
    ensureOnlyAllowedFields(req.body, subscriptionFields);
    const candidateId = normalizeObjectId(req.params.id, "candidate id");
    const candidate = await updateImportCandidate({
      candidateId,
      userId: req.user._id,
      updates: req.body,
    });

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmSmartImportCandidate = async (req, res, next) => {
  try {
    const candidateId = normalizeObjectId(req.params.id, "candidate id");
    const result = await confirmImportCandidate({
      candidateId,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectSmartImportCandidate = async (req, res, next) => {
  try {
    const candidateId = normalizeObjectId(req.params.id, "candidate id");
    const candidate = await rejectImportCandidate({
      candidateId,
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};
