import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "conversation",
        required: true 
    },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "doctor",
        required: true 
    },
    text: { 
        type: String, 
        default: "" 
    },
    attachment: {
        url: { type: String },
        fileName: { type: String },
        fileType: { type: String }, // 'image' or 'document'
        fileSize: { type: Number }, // in bytes
        mimeType: { type: String }
    },
    readBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "doctor" 
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

const messageModel =
    mongoose.models.message || mongoose.model("message", messageSchema);

export default messageModel;