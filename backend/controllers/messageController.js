import conversationModel from "../models/conversationModel.js";
import messageModel from "../models/messageModel.js";
import doctorModel from "../models/doctorModel.js";

// 1️⃣ Create or get existing 1-1 conversation
const getOrCreateConversation = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;

        if (!senderId || !receiverId) {
            return res.json({ success: false, message: "Both sender and receiver IDs are required" });
        }

        if (senderId === receiverId) {
            return res.json({ success: false, message: "Cannot create conversation with yourself" });
        }

        let conversation = await conversationModel.findOne({
            isGroup: false,
            members: { $all: [senderId, receiverId] }
        }).populate("members", "name email image speciality");

        if (!conversation) {
            conversation = new conversationModel({
                members: [senderId, receiverId],
                isGroup: false,
                lastMessage: "",
                updatedAt: new Date()
            });
            await conversation.save();
            conversation = await conversationModel.findById(conversation._id)
                .populate("members", "name email image speciality");
        }

        res.json({ success: true, conversation });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2️⃣ Create a group conversation - FIXED to match frontend
const createGroupConversation = async (req, res) => {
    try {
        const { name, members } = req.body; // Changed from adminId, groupName, memberIds
        const adminId = req.docId; // Get from auth middleware

        console.log("Creating group with:", { name, members, adminId });

        if (!name || !members || members.length < 2) {
            return res.json({ success: false, message: "Group name and at least two members are required" });
        }

        // Ensure all members are unique
        const uniqueMembers = [...new Set(members)];

        const newGroup = new conversationModel({
            members: uniqueMembers,
            isGroup: true,
            groupName: name, // Changed from groupName to name
            admin: adminId,
            lastMessage: "",
            updatedAt: new Date()
        });

        await newGroup.save();

        const populatedGroup = await conversationModel.findById(newGroup._id)
            .populate("members", "name email image speciality")
            .populate("admin", "name email image speciality");

        console.log("Group created successfully:", populatedGroup);

        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.error("Group creation error:", error);
        res.json({ success: false, message: error.message });
    }
};

// 3️⃣ Send a message (works for 1-1 and group)
const sendMessage = async (req, res) => {
    try {
        const { conversationId, senderId, text, attachment } = req.body;

        if (!conversationId || !senderId) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        // Must have either text or attachment
        if (!text && !attachment) {
            return res.json({ success: false, message: "Message must contain text or attachment" });
        }

        const conversation = await conversationModel.findById(conversationId);
        if (!conversation) {
            return res.json({ success: false, message: "Conversation not found" });
        }

        if (!conversation.members.includes(senderId)) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const messageData = {
            conversationId,
            senderId,
            text: text || "",
            readBy: [senderId],
            createdAt: new Date()
        };

        // Add attachment if present
        if (attachment) {
            messageData.attachment = attachment;
        }

        const newMessage = new messageModel(messageData);
        await newMessage.save();

        // Update last message
        let lastMessageText = text || "";
        if (attachment && !text) {
            lastMessageText = attachment.fileType === "image" ? "📷 Image" : "📎 Attachment";
        }

        await conversationModel.findByIdAndUpdate(conversationId, {
            lastMessage: lastMessageText.length > 50 ? lastMessageText.substring(0, 50) + "..." : lastMessageText,
            updatedAt: new Date()
        });

        const populatedMessage = await messageModel.findById(newMessage._id)
            .populate("senderId", "name image");

        res.json({ success: true, message: populatedMessage });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 4️⃣ Get all messages in a conversation
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await messageModel
            .find({ conversationId })
            .populate("senderId", "name image")
            .sort({ createdAt: 1 });

        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 5️⃣ Get all conversations for a doctor
const getDoctorConversations = async (req, res) => {
    try {
        const { docId } = req.params;

        const conversations = await conversationModel
            .find({ members: docId, isGroup: false }) // Only non-group conversations
            .populate("members", "name email image speciality")
            .sort({ updatedAt: -1 });

        res.json({ success: true, conversations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 6️⃣ Get all groups for a doctor - NEW ENDPOINT
const getDoctorGroups = async (req, res) => {
    try {
        const { docId } = req.params;

        const groups = await conversationModel
            .find({ members: docId, isGroup: true }) // Only group conversations
            .populate("members", "name email image speciality")
            .populate("admin", "name email image speciality")
            .sort({ updatedAt: -1 });

        res.json({ success: true, groups });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 7️⃣ Mark messages as read
const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId, docId } = req.body;

        await messageModel.updateMany(
            {
                conversationId,
                senderId: { $ne: docId },
                readBy: { $ne: docId }
            },
            { $addToSet: { readBy: docId } }
        );

        res.json({ success: true, message: "Messages marked as read" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 8️⃣ Unread count
const getUnreadCount = async (req, res) => {
    try {
        const { docId } = req.params;

        const conversations = await conversationModel.find({ members: docId });
        const ids = conversations.map(c => c._id);

        const unread = await messageModel.countDocuments({
            conversationId: { $in: ids },
            senderId: { $ne: docId },
            readBy: { $ne: docId }
        });

        res.json({ success: true, unreadCount: unread });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export {
    getOrCreateConversation,
    createGroupConversation,
    sendMessage,
    getMessages,
    getDoctorConversations,
    getDoctorGroups, // NEW EXPORT
    markMessagesAsRead,
    getUnreadCount
};