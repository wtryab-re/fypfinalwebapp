import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import Case from "../models/Case.js";
import AIResult from "../models/AiResult.js";
import { sendImageToAI } from "../services/aiService.js";

// API for doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await doctorModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    return res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelled" });
    }

    return res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment Completed" });
    }

    return res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    return res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    return res.json({ success: true, message: "Availablity Changed" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for Doctor Panel
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;

    console.log("🔍 Fetching profile for docId:", docId);

    if (!docId) {
      return res.json({ success: false, message: "Doctor ID missing" });
    }

    const profileData = await doctorModel.findById(docId).select("-password");

    if (!profileData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    console.log("✅ Profile found:", profileData.name);

    return res.json({ success: true, doctor: profileData });
  } catch (error) {
    console.log("❌ Error in doctorProfile:", error);
    return res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, about, address, available } = req.body;

    await doctorModel.findByIdAndUpdate(docId, {
      fees,
      address,
      about,
      available,
    });

    return res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse(),
    };

    return res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// ============ CASE MANAGEMENT APIs ============

// API to get all cases for doctor panel (with AI results and prioritization)
// MODIFIED: Now returns available cases and my cases separately
const getCases = async (req, res) => {
  try {
    const { docId } = req.body; // From auth middleware

    console.log("🔍 Fetching cases for doctor:", docId);

    // Fetch all AI_PROCESSED cases with AI results populated
    const allCases = await Case.find({
      status: { $in: ["AI_PROCESSED", "ASSIGNED_TO_DOCTOR", "reviewed"] }
    })
      .populate("report.doctorId", "name speciality")
      .populate("aiResult")
      .populate("assignedDoctor", "name speciality")
      .sort({ createdAt: -1 });

    // Separate into available and assigned cases
    const availableCases = allCases.filter(c => !c.assignedDoctor);
    const myCases = allCases.filter(c => c.assignedDoctor && c.assignedDoctor._id.toString() === docId);

    console.log(`✅ Found ${availableCases.length} available cases, ${myCases.length} my cases`);

    // Prioritize both lists
    const prioritize = (cases) => {
      return cases.sort((a, b) => {
        const getPriority = (caseData) => {
          if (!caseData.aiResult || !caseData.aiResult.predictions) return 3;
          
          const topPrediction = caseData.aiResult.predictions[0];
          if (!topPrediction) return 3;

          const label = topPrediction.label.toLowerCase();
          const confidence = topPrediction.confidence;

          if (label.includes('tb') && confidence > 80) return 0;
          if (label.includes('pneumonia') && confidence > 80) return 1;
          if (label.includes('tb') && confidence > 50) return 2;
          if (label.includes('pneumonia') && confidence > 50) return 3;
          
          return 4;
        };

        return getPriority(a) - getPriority(b);
      });
    };

    return res.json({ 
      success: true, 
      availableCases: prioritize(availableCases),
      myCases: prioritize(myCases)
    });
  } catch (error) {
    console.log("❌ Error in getCases:", error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get a single case by ID (with AI results)
const getCaseById = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseData = await Case.findById(caseId)
      .populate("report.doctorId", "name speciality")
      .populate("aiResult");

    if (!caseData) {
      return res.json({ success: false, message: "Case not found" });
    }

    return res.json({ success: true, case: caseData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// NEW: API to accept a case
const acceptCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { docId } = req.body; // From auth middleware

    console.log(`🤝 Doctor ${docId} attempting to accept case ${caseId}`);

    // Find the case
    const caseData = await Case.findById(caseId);

    if (!caseData) {
      return res.json({ success: false, message: "Case not found" });
    }

    // Check if already assigned
    if (caseData.assignedDoctor) {
      console.log(`❌ Case already assigned to ${caseData.assignedDoctor}`);
      return res.json({ 
        success: false, 
        message: "This case has already been accepted by another doctor" 
      });
    }

    // Check if case is in correct status
    if (caseData.status !== "AI_PROCESSED") {
      return res.json({ 
        success: false, 
        message: "Case is not ready for assignment" 
      });
    }

    // Assign the case
    caseData.assignedDoctor = docId;
    caseData.status = "ASSIGNED_TO_DOCTOR";
    await caseData.save();

    console.log(`✅ Case ${caseId} assigned to doctor ${docId}`);

    return res.json({ 
      success: true, 
      message: "Case accepted successfully",
      case: caseData 
    });
  } catch (error) {
    console.log("❌ Error in acceptCase:", error);
    return res.json({ success: false, message: error.message });
  }
};

// NEW: API to reject a case (removes from view)
const rejectCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { docId } = req.body;

    console.log(`❌ Doctor ${docId} rejected case ${caseId}`);

    // We don't need to modify the case, just return success
    // The case will disappear from the doctor's available list
    return res.json({ 
      success: true, 
      message: "Case rejected" 
    });
  } catch (error) {
    console.log("❌ Error in rejectCase:", error);
    return res.json({ success: false, message: error.message });
  }
};

// API to submit report for a case
// MODIFIED: Check if case is assigned to this doctor
const submitReport = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { docId } = req.body; // From auth middleware
    const { diagnosis, findings, recommendations, medications, followUp } =
      req.body;

    // Validate required fields
    if (!diagnosis || !findings || !recommendations) {
      return res.json({
        success: false,
        message: "Diagnosis, findings, and recommendations are required",
      });
    }

    // Find the case
    const caseData = await Case.findById(caseId);

    if (!caseData) {
      return res.json({ success: false, message: "Case not found" });
    }

    // SECURITY CHECK: Verify this doctor is assigned to this case
    if (!caseData.assignedDoctor || caseData.assignedDoctor.toString() !== docId) {
      return res.json({ 
        success: false, 
        message: "You are not authorized to submit a report for this case" 
      });
    }

    // Get doctor details
    const doctor = await doctorModel.findById(docId).select("name speciality");

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Update the case with report
    caseData.report = {
      diagnosis,
      findings,
      recommendations,
      medications: medications || "",
      followUp: followUp || "",
      doctorId: docId,
      doctorName: doctor.name,
      submittedAt: new Date(),
    };
    caseData.status = "reviewed";

    await caseData.save();

    console.log(`✅ Report submitted for case ${caseId} by doctor ${docId}`);

    return res.json({
      success: true,
      message: "Report submitted successfully",
      case: caseData,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Helper function to process case with AI
const processCaseWithAI = async (caseId) => {
  try {
    const caseData = await Case.findById(caseId);
    if (!caseData) throw new Error("Case not found");

    const aiResult = await sendImageToAI(caseData.imageUrl);
    if (!aiResult.success) throw new Error("AI failed: " + aiResult.message);

    // Save AIResult
    const newAIResult = new AIResult({
      caseId: caseData._id,
      prediction: aiResult.prediction,
      heatmapUrl: aiResult.heatmap,
      qcResults: aiResult.qc_results,
    });
    await newAIResult.save();

    // Update Case
    caseData.aiResult = newAIResult._id;
    caseData.status = "AI_PROCESSED";
    await caseData.save();

    return newAIResult;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export {
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
  acceptCase,
  rejectCase,
  processCaseWithAI,
};