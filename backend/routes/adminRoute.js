import express from "express";
import {
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  addDoctor,
  deleteDoctor,
  allDoctors,
  adminDashboard,
  getPendingWorkers,
  getApprovedWorkers,
  updateWorkerStatus,
  deleteWorker,
  getAllCases,
  getAllPatients,
  getAllUsers,
} from "../controllers/adminController.js";
import authAdmin from "../middleware/authAdmin.js";
import upload from "../middleware/multer.js";

const adminRouter = express.Router();

// Existing routes
adminRouter.post("/login", loginAdmin);

// UPDATED: Accept both image and certificate files
adminRouter.post(
  "/add-doctor",
  authAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  addDoctor
);

adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.post("/delete-doctor", authAdmin, deleteDoctor);

// Worker management routes
adminRouter.get("/pending-workers", authAdmin, getPendingWorkers);
adminRouter.get("/approved-workers", authAdmin, getApprovedWorkers);
adminRouter.post("/update-worker-status", authAdmin, updateWorkerStatus);
adminRouter.post("/delete-worker", authAdmin, deleteWorker);

// Routes for cases and patients
adminRouter.get("/all-cases", authAdmin, getAllCases);
adminRouter.get("/all-patients", authAdmin, getAllPatients);
adminRouter.get("/all-users", authAdmin, getAllUsers);

export default adminRouter;
