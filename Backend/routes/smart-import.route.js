import { Router } from "express";
import {
  confirmSmartImportCandidate,
  createSmartImportCandidates,
  editSmartImportCandidate,
  listSmartImportCandidates,
  rejectSmartImportCandidate,
} from "../controllers/smart-import.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const smartImportRouter = Router();

smartImportRouter.use(requireAuth);

smartImportRouter.get("/candidates", listSmartImportCandidates);
smartImportRouter.post("/candidates", createSmartImportCandidates);
smartImportRouter.patch("/candidates/:id", editSmartImportCandidate);
smartImportRouter.post("/candidates/:id/confirm", confirmSmartImportCandidate);
smartImportRouter.patch("/candidates/:id/reject", rejectSmartImportCandidate);

export default smartImportRouter;
