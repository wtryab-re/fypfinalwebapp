import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        required: true
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        default: null
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
        default: null
    },
    lastMessage: {
        type: String,
        default: ""
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for faster queries
conversationSchema.index({ members: 1 });
conversationSchema.index({ updatedAt: -1 });

const conversationModel =
    mongoose.models.conversation ||
    mongoose.model("conversation", conversationSchema);

export default conversationModel;
