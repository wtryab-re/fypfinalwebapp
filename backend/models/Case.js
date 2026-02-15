import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    patientHistory: { type: String, required: true },
    imageUrl: { type: String, required: true },

    // AI Result reference
    aiResult: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIResult",
      default: null,
    },

    // Report fields
    report: {
      diagnosis: { type: String, default: null },
      findings: { type: String, default: null },
      recommendations: { type: String, default: null },
      medications: { type: String, default: null },
      followUp: { type: String, default: null },
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        default: null,
      },
      doctorName: { type: String, default: null },
      submittedAt: { type: Date, default: null },
    },

    // Status
    status: {
      type: String,
      enum: [
        "PENDING_WORKER_REVIEW",
        "APPROVED_FOR_AI",
        "AI_PROCESSING",
        "AI_PROCESSED",
        "AI_FAILED",
        "ASSIGNED_TO_DOCTOR",
        "pending",
        "reviewed",
        "completed",
      ],
      default: "pending",
    },

    // AI Error tracking
    aiError: {
      type: String,
      default: null,
    },

    // Worker who uploaded (if applicable)
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Manual checks from worker (if applicable)
    manualChecks: {
      isLungs: { type: Boolean, default: null },
      isClear: { type: Boolean, default: null },
      isVerified: { type: Boolean, default: null },
    },

    // Assigned doctor (if applicable)
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Case = mongoose.model("Case", caseSchema);

export default Case;
