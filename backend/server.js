import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import messageRouter from "./routes/messageRoutes.js";
import caseRouter from "./routes/caseRoute.js";

import colors from "colors";
// Load environment variables
dotenv.config();

// App config
const app = express();
const port = process.env.PORT || 4000;

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to DB + Cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/messages", messageRouter);
app.use("/api/cases", caseRouter);
app.use("/", (req, res) => {
  res.render("Homepage");
});
// Test route
app.get("/", (req, res) => {
  res.json({ success: true, message: "API working" });
});

// ===== SOCKET.IO REAL-TIME MESSAGING =====

// Map to track online doctors: { doctorId: socketId }
const onlineDoctors = new Map();

io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  // Doctor comes online
  socket.on("doctor-online", (docId) => {
    console.log(`👨‍⚕️ Doctor ${docId} is online (socket: ${socket.id})`);
    onlineDoctors.set(docId, socket.id);

    // Broadcast to all connected clients that this doctor is online
    socket.broadcast.emit("doctor-status-changed", { docId, isOnline: true });
  });

  // Doctor sends a 1-1 message
  socket.on("send-message", (data) => {
    const { receiverId, message } = data;
    console.log(`📨 Message from ${data.senderId} to ${receiverId}`);

    // Get receiver's socket ID
    const receiverSocketId = onlineDoctors.get(receiverId);

    // If receiver is online, send them the message
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", message);
      console.log(`Message delivered to ${receiverId}`);
    } else {
      console.log(`Receiver ${receiverId} is offline`);
    }
  });

  // JOIN GROUP ROOM - NEW
  socket.on("join-group", (groupId) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined group ${groupId}`);
  });

  // SEND GROUP MESSAGE - NEW
  socket.on("send-group-message", (data) => {
    const { groupId, senderId, message } = data;
    console.log(`Group message from ${senderId} to group ${groupId}`);

    // Send to all members in the group room except sender
    socket.to(groupId).emit("receive-message", message);
    console.log(`Group message sent to group ${groupId}`);
  });

  // Doctor is typing in 1-1 chat
  socket.on("typing", (data) => {
    const { receiverId, senderId, isTyping } = data;
    const receiverSocketId = onlineDoctors.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing-status", { senderId, isTyping });
    }
  });

  // Doctor is typing in GROUP - NEW
  socket.on("typing-group", (data) => {
    const { groupId, senderId, isTyping } = data;
    console.log(`Typing in group ${groupId} from ${senderId}: ${isTyping}`);

    // Send typing status to all members in the group except sender
    socket.to(groupId).emit("typing-status", { senderId, isTyping });
  });

  // Mark messages as read (real-time notification)
  socket.on("messages-read", (data) => {
    const { conversationId, senderId } = data;
    const senderSocketId = onlineDoctors.get(senderId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("messages-read-notification", {
        conversationId,
      });
    }
  });

  // Doctor disconnects
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);

    // Find and remove the doctor from online map
    for (const [docId, socketId] of onlineDoctors.entries()) {
      if (socketId === socket.id) {
        onlineDoctors.delete(docId);
        console.log(`👨‍⚕️ Doctor ${docId} went offline`);

        // Broadcast to all clients that this doctor is offline
        socket.broadcast.emit("doctor-status-changed", {
          docId,
          isOnline: false,
        });
        break;
      }
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Export io for potential use in other files (like controllers)
export { io };

// Start server with Socket.IO
server.listen(port, () =>
  console.log(`Server started with Socket.IO on PORT: ${port}`.green.bold),
);
