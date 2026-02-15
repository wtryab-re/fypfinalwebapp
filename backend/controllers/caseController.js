import Case from "../models/Case.js";
import doctorModel from "../models/doctorModel.js";
import AIResult from "../models/AIResult.js";
import { sendImageToAI } from "../services/aiService.js";

// API to get all cases for doctor panel
const getCases = async (req, res) => {
  try {
    // Fetch all cases, sorted by newest first, populate doctor info
    const cases = await Case.find({})
      .populate("report.doctorId", "name speciality")
      .sort({ createdAt: -1 });

    return res.json({ success: true, cases });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// API to get a single case by ID
const getCaseById = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseData = await Case.findById(caseId).populate(
      "report.doctorId",
      "name speciality",
    );

    if (!caseData) {
      return res.json({ success: false, message: "Case not found" });
    }

    return res.json({ success: true, case: caseData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// NEW: API to submit report for a case
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

    // Get doctor details
    const doctor = await doctorModel.findById(docId).select("name speciality");

    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    // Find and update the case
    const caseData = await Case.findById(caseId);

    if (!caseData) {
      return res.json({ success: false, message: "Case not found" });
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
      reportedAt: new Date(),
    };
    caseData.status = "reviewed";

    await caseData.save();

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
      heatmapUrl: aiResult.heatmap, // you might need to upload this back to Cloudinary
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

export { getCases, getCaseById, submitReport, processCaseWithAI };
