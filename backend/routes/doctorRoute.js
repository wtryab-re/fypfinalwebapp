import express from "express";
import {
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  doctorList,
  changeAvailablity,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  getCases,
  getCaseById,
  submitReport,
  acceptCase,    // ADD THIS
  rejectCase,    // ADD THIS
} from "../controllers/doctorController.js";
import authDoctor from "../middleware/authDoctor.js";

const doctorRouter = express.Router();

// Authentication
doctorRouter.post("/login", loginDoctor);

// Appointments
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);

// Doctor Management
doctorRouter.get("/list", doctorList);
doctorRouter.post("/change-availability", authDoctor, changeAvailablity);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

// Case Management
// IMPORTANT: Specific routes (accept, reject, report) MUST come before dynamic :caseId route
doctorRouter.get("/cases", authDoctor, getCases);
doctorRouter.post("/cases/:caseId/accept", authDoctor, acceptCase);    // ADD THIS
doctorRouter.post("/cases/:caseId/reject", authDoctor, rejectCase);    // ADD THIS
doctorRouter.post("/cases/:caseId/report", authDoctor, submitReport);
doctorRouter.get("/cases/:caseId", authDoctor, getCaseById);           // This MUST be last

export default doctorRouter;