import mongoose from "mongoose";

const aiResultSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },

    qcPass: {
      type: Boolean,
      required: true,
    },

    qcResults: {
      type: Object, // flexible, matches Flask output
      required: true,
    },

    predictions: [
      {
        label: {
          type: String,
          required: true,
        },
        confidence: {
          type: Number,
          required: true,
        },
      },
    ],

    heatmapUrl: {
      type: String,
      required: true,
    },

    modelVersion: {
      type: String,
      default: "MobileNetV2-v1",
    },

    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AIResult = mongoose.model("AIResult", aiResultSchema);
export default AIResult;
