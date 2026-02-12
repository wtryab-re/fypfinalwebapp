import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import User from "../models/User.js";
import Case from "../models/Case.js";

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });
    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for adding Doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.files?.image?.[0]; // Profile image
    const certificateFile = req.files?.certificate?.[0]; // Certificate image

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload profile image to Cloudinary (if provided)
    let imageUrl = null;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
        folder: "doctors/profiles",
      });
      imageUrl = imageUpload.secure_url;
    }

    // Upload certificate to Cloudinary (if provided)
    let certificateUrl = null;
    if (certificateFile) {
      const certificateUpload = await cloudinary.uploader.upload(
        certificateFile.path,
        {
          resource_type: "image",
          folder: "doctors/certificates",
        }
      );
      certificateUrl = certificateUpload.secure_url;
    }

    const doctorData = {
      name,
      email,
      image: imageUrl,
      certificate: certificateUrl, // Save certificate URL
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to bulk delete doctors
const deleteDoctor = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({
        success: false,
        message: "An array of doctor IDs is required",
      });
    }

    // Check which doctors actually exist
    const existingDoctors = await doctorModel.find({ _id: { $in: ids } });
    if (existingDoctors.length === 0) {
      return res.json({
        success: false,
        message: "No matching doctors found to delete",
      });
    }

    // Delete all doctors in one go
    await doctorModel.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${existingDoctors.length} doctor(s) deleted successfully`,
    });
  } catch (error) {
    console.error("❌ Error in bulk delete:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    // Get pending workers count
    const pendingWorkers = await userModel.find({
      role: "worker",
      isApproved: false,
    });
    const approvedWorkers = await userModel.find({
      role: "worker",
      isApproved: true,
    });

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      pendingWorkers: pendingWorkers.length, // Add this
      latestAppointments: appointments.reverse(),
      approvedWorkers: approvedWorkers.length,
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ===== NEW WORKER MANAGEMENT APIs =====

// API to get all pending workers (from app)
const getPendingWorkers = async (req, res) => {
  try {
    console.log("🔍 Fetching pending workers...");

    const pendingWorkers = await User.find({
      role: "worker",
      isApproved: false,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    console.log("✅ Found pending workers:", pendingWorkers.length);

    res.json({ success: true, workers: pendingWorkers });
  } catch (error) {
    console.error("❌ Error fetching pending workers:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all approved workers
const getApprovedWorkers = async (req, res) => {
  try {
    console.log("🔍 Fetching approved workers...");

    const approvedWorkers = await User.find({
      role: "worker",
      isApproved: true,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    console.log("✅ Found approved workers:", approvedWorkers.length);

    res.json({ success: true, workers: approvedWorkers });
  } catch (error) {
    console.error("❌ Error fetching approved workers:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to approve or reject worker
const updateWorkerStatus = async (req, res) => {
  try {
    const { workerId, isApproved } = req.body;

    console.log(
      `📝 Updating worker ${workerId} to ${
        isApproved ? "approved" : "rejected"
      }`
    );

    if (!workerId) {
      return res.json({ success: false, message: "Worker ID is required" });
    }

    if (typeof isApproved !== "boolean") {
      return res.json({ success: false, message: "Invalid approval status" });
    }

    const worker = await User.findById(workerId);

    if (!worker) {
      return res.json({ success: false, message: "Worker not found" });
    }

    if (worker.role !== "worker") {
      return res.json({ success: false, message: "Invalid user role" });
    }

    // Update the worker's approval status
    await User.findByIdAndUpdate(workerId, { isApproved });

    console.log(
      `✅ Worker ${isApproved ? "approved" : "rejected"} successfully`
    );

    res.json({
      success: true,
      message: `Worker ${isApproved ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    console.error("❌ Error updating worker status:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete rejected worker
const deleteWorker = async (req, res) => {
  try {
    const { workerId } = req.body;

    console.log(`🗑️ Deleting worker ${workerId}`);

    if (!workerId) {
      return res.json({ success: false, message: "Worker ID is required" });
    }

    const worker = await User.findById(workerId);

    if (!worker) {
      return res.json({ success: false, message: "Worker not found" });
    }

    if (worker.role !== "worker") {
      return res.json({ success: false, message: "Invalid user role" });
    }

    await userModel.findByIdAndDelete(workerId);

    console.log(`✅ Worker deleted successfully`);

    res.json({
      success: true,
      message: "Worker deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting worker:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all cases (for admin view)
// FIXED: Added .populate("aiResult") to fetch complete AI data
const getAllCases = async (req, res) => {
  try {
    console.log("🔍 Fetching all cases for admin...");

    const cases = await Case.find({})
      .populate("report.doctorId", "name email speciality")
      .populate("aiResult") // FIXED: This populates the full AI result object
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${cases.length} cases`);
    console.log(`✅ First case has aiResult:`, cases[0]?.aiResult ? 'YES (populated)' : 'NO');

    res.json({ success: true, cases });
  } catch (error) {
    console.error("❌ Error fetching cases:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all patients (users with role 'patient')
const getAllPatients = async (req, res) => {
  try {
    console.log("🔍 Fetching all patients...");

    const patients = await User.find({ role: "patient" })
      .select("-password")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${patients.length} patients`);

    res.json({ success: true, patients });
  } catch (error) {
    console.error("❌ Error fetching patients:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all users (both patients and workers)
const getAllUsers = async (req, res) => {
  try {
    console.log("🔍 Fetching all users...");

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${users.length} users`);

    res.json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
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
};