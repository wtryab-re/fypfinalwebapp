import express from "express";
import {
    getOrCreateConversation,
    createGroupConversation,
    sendMessage,
    getMessages,
    getDoctorConversations,
    getDoctorGroups, // NEW IMPORT
    markMessagesAsRead,
    getUnreadCount
} from "../controllers/messageController.js";
import authDoctor from "../middleware/authDoctor.js";

const messageRouter = express.Router();

// 1-1 chat
messageRouter.post("/conversation", authDoctor, getOrCreateConversation);

// Group chat
messageRouter.post("/conversation/group", authDoctor, createGroupConversation);
messageRouter.get("/group/:docId", authDoctor, getDoctorGroups); // NEW ROUTE

// Messages
messageRouter.post("/send", authDoctor, sendMessage);
messageRouter.get("/conversation/:conversationId", authDoctor, getMessages);
messageRouter.get("/doctor/:docId", authDoctor, getDoctorConversations);
messageRouter.post("/mark-read", authDoctor, markMessagesAsRead);
messageRouter.get("/unread/:docId", authDoctor, getUnreadCount);

export default messageRouter;