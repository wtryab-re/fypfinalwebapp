import express from 'express';
import { getCases, getCaseById, submitReport, acceptCase, rejectCase } from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';

const caseRouter = express.Router();

// IMPORTANT: Routes are mounted at /api/doctor/cases
// So these paths are relative to that base

// Get all cases - GET /api/doctor/cases
caseRouter.get("/", authDoctor, getCases);

// Accept a case - POST /api/doctor/cases/:caseId/accept
caseRouter.post("/:caseId/accept", authDoctor, acceptCase);

// Reject a case - POST /api/doctor/cases/:caseId/reject
caseRouter.post("/:caseId/reject", authDoctor, rejectCase);

// Submit report - POST /api/doctor/cases/:caseId/report
caseRouter.post("/:caseId/report", authDoctor, submitReport);

// Get single case - GET /api/doctor/cases/:caseId
// This must come LAST to avoid matching "accept", "reject", etc. as caseIds
caseRouter.get("/:caseId", authDoctor, getCaseById);

export default caseRouter;