import React, { useState, useEffect, useRef, useContext } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorChat = () => {
  const { dToken, backendUrl, profileData, getProfileData } =
    useContext(DoctorContext);
  const docId = profileData?._id;

  const [allDoctors, setAllDoctors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineDoctors, setOnlineDoctors] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("direct");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "DR";

  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  useEffect(() => {
    if (dToken && !profileData) getProfileData();
  }, [dToken, profileData]);

  // 🔌 SOCKET.IO Setup
  useEffect(() => {
    if (!docId || !dToken) return;

    socketRef.current = io(backendUrl, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("doctor-online", docId);
    });

    socketRef.current.on("receive-message", (message) => {
      // Handle both direct and group messages
      if (
        message.conversationId === currentConversation?._id ||
        message.groupId === currentConversation?._id
      ) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    socketRef.current.on("typing-status", ({ senderId, isTyping }) => {
      if (
        (activeTab === "direct" && senderId === selectedDoctor?._id) ||
        (activeTab === "group" && selectedGroup)
      ) {
        setIsTyping(isTyping);
      }
    });

    socketRef.current.on(
      "doctor-status-changed",
      ({ docId: changedDocId, isOnline }) => {
        setOnlineDoctors((prev) => {
          const updated = new Set(prev);
          if (isOnline) updated.add(changedDocId);
          else updated.delete(changedDocId);
          return updated;
        });
      }
    );

    return () => {
      socketRef.current.disconnect();
    };
  }, [
    docId,
    dToken,
    backendUrl,
    currentConversation,
    selectedDoctor,
    selectedGroup,
    activeTab,
  ]);

  useEffect(() => {
    if (!dToken || !docId) return;

    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
        if (data.success)
          setAllDoctors(data.doctors.filter((doc) => doc._id !== docId));
      } catch {}
    };

    const fetchGroups = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/messages/group/${docId}`,
          { headers: { dToken } }
        );
        if (data.success) setGroups(data.groups);
      } catch {}
    };

    fetchDoctors();
    fetchGroups();
  }, [dToken, docId, backendUrl]);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatFileSize = (bytes) =>
    bytes < 1024
      ? `${bytes} B`
      : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedGroup(null);
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/messages/conversation`,
        { senderId: docId, receiverId: doctor._id },
        { headers: { dToken } }
      );
      if (data.success) {
        setCurrentConversation(data.conversation);
        const res = await axios.get(
          `${backendUrl}/api/messages/conversation/${data.conversation._id}`,
          { headers: { dToken } }
        );
        if (res.data.success) setMessages(res.data.messages);
        scrollToBottom();
      }
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setSelectedDoctor(null);
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/messages/conversation/${group._id}`,
        { headers: { dToken } }
      );
      if (data.success) setMessages(data.messages);
      setCurrentConversation(group);
      socketRef.current.emit("join-group", group._id);
      scrollToBottom();
    } catch {
      toast.error("Failed to load group chat");
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = () => {
    if (!currentConversation) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (activeTab === "direct" && selectedDoctor) {
      socketRef.current.emit("typing", {
        senderId: docId,
        receiverId: selectedDoctor._id,
        isTyping: true,
      });
    } else if (activeTab === "group" && selectedGroup) {
      socketRef.current.emit("typing-group", {
        groupId: selectedGroup._id,
        senderId: docId,
        isTyping: true,
      });
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (activeTab === "direct" && selectedDoctor) {
        socketRef.current.emit("typing", {
          senderId: docId,
          receiverId: selectedDoctor._id,
          isTyping: false,
        });
      } else if (activeTab === "group" && selectedGroup) {
        socketRef.current.emit("typing-group", {
          groupId: selectedGroup._id,
          senderId: docId,
          isTyping: false,
        });
      }
    }, 2000);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "School_LMS");
    const cloudName = "ddinfxgsy";
    const resourceType = file.type.startsWith("image/") ? "image" : "raw";
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      formData
    );
    return res.data.secure_url;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE)
      return toast.error("File too large (max 5MB)");
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !currentConversation) return;
    setUploading(true);
    try {
      let attachmentData = null;
      if (selectedFile) {
        const url = await uploadToCloudinary(selectedFile);
        attachmentData = {
          url,
          fileName: selectedFile.name,
          fileType: selectedFile.type.startsWith("image/")
            ? "image"
            : "document",
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
        };
      }

      const payload = {
        conversationId: currentConversation._id,
        senderId: docId,
        text: newMessage,
        attachment: attachmentData,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/messages/send`,
        payload,
        { headers: { dToken } }
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        setSelectedFile(null);
        setFilePreview(null);
        scrollToBottom();

        // 🧠 EMIT proper socket event (direct or group)
        if (activeTab === "direct" && selectedDoctor) {
          socketRef.current.emit("send-message", {
            senderId: docId,
            receiverId: selectedDoctor._id,
            message: data.message,
          });
        } else if (activeTab === "group" && selectedGroup) {
          socketRef.current.emit("send-group-message", {
            groupId: selectedGroup._id,
            senderId: docId,
            message: data.message,
          });
        }
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setUploading(false);
    }
  };

  const scrollToBottom = () =>
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Enter a group name");
    if (groupMembers.length === 0)
      return toast.error("Select at least one member");

    try {
      const payload = {
        name: groupName,
        members: [docId, ...groupMembers],
      };

      const { data } = await axios.post(
        `${backendUrl}/api/messages/conversation/group`,
        payload,
        { headers: { dToken } }
      );

      if (data.success) {
        setGroups((prev) => [...prev, data.group]);
        toast.success("Group created successfully!");
        setShowCreateGroupModal(false);
        setGroupName("");
        setGroupMembers([]);
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to create group");
    }
  };

  const handleToggleMember = (id) =>
    setGroupMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  const renderMessage = (msg) => {
    const isOwn = msg.senderId._id === docId;
    return (
      <div
        key={msg._id}
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}
      >
        <div
          className={`max-w-[70%] px-4 py-2 border rounded-md ${
            isOwn
              ? "bg-[#F5F9FF] border-[#3a8dff]/30"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          {activeTab === "group" && !isOwn && (
            <p className="text-xs font-semibold text-gray-600 mb-1">
              {msg.senderId.name}
            </p>
          )}
          {msg.text && (
            <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
          )}
          {msg.attachment && (
            <div className="mt-1">
              {msg.attachment.fileType === "image" ? (
                <img
                  src={msg.attachment.url}
                  alt="Attachment"
                  className="mt-1 rounded max-h-64 object-contain"
                />
              ) : (
                <a
                  href={msg.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3a8dff] underline text-xs"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-paperclip-icon lucide-paperclip"
                  >
                    <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
                  </svg>{" "}
                  {msg.attachment.fileName} (
                  {formatFileSize(msg.attachment.fileSize)})
                </a>
              )}
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-1 text-right">
            {formatTime(msg.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex h-[calc(100vh-100px)] bg-gray-50">
        {/* Sidebar */}
        <aside className="w-1/4 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-5 bg-[#3a8dff] text-white flex justify-between items-center">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="bg-white text-[#3a8dff] text-sm font-semibold px-3 py-1 rounded-md hover:bg-gray-100"
            >
              + Group
            </button>
          </div>

          <div className="flex">
            {["direct", "group"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium uppercase tracking-wide ${
                  activeTab === tab
                    ? "border-b-2 border-[#3a8dff] text-[#3a8dff]"
                    : "text-gray-500 hover:text-[#3a8dff]/70"
                }`}
              >
                {tab === "direct" ? "Direct" : "Groups"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "direct"
              ? allDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => handleSelectDoctor(doc)}
                    className={`flex items-center gap-3 p-3 rounded-md mb-2 cursor-pointer ${
                      selectedDoctor?._id === doc._id
                        ? "bg-[#3a8dff]/10 border border-[#3a8dff]/20"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                        doc.name
                      )}`}
                    >
                      {getInitials(doc.name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {doc.speciality}
                      </p>
                    </div>
                  </div>
                ))
              : groups.map((group) => (
                  <div
                    key={group._id}
                    onClick={() => handleSelectGroup(group)}
                    className={`flex items-center gap-3 p-3 rounded-md mb-2 cursor-pointer ${
                      selectedGroup?._id === group._id
                        ? "bg-[#3a8dff]/10 border border-[#3a8dff]/20"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                        group.name
                      )}`}
                    >
                      {getInitials(group.name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 truncate">
                        {group.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </aside>

        {/* Chat */}
        <section className="flex-1 flex flex-col bg-white">
          {!currentConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
              <div className="text-5xl mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-messages-square-icon lucide-messages-square"
                >
                  <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Select a conversation
              </h3>
              <p className="text-gray-500 text-sm">
                Choose a doctor or group to start chatting.
              </p>
            </div>
          ) : (
            <>
              <header className="px-6 py-4 border-b bg-white flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(
                    activeTab === "direct"
                      ? selectedDoctor?.name
                      : selectedGroup?.name
                  )}`}
                >
                  {getInitials(
                    activeTab === "direct"
                      ? selectedDoctor?.name
                      : selectedGroup?.name
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {activeTab === "direct"
                      ? selectedDoctor?.name
                      : selectedGroup?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeTab === "direct"
                      ? onlineDoctors.has(selectedDoctor?._id)
                        ? "Online"
                        : "Offline"
                      : `${selectedGroup?.members?.length || 0} members`}
                  </p>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin w-10 h-10 border-2 border-[#3a8dff] border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => renderMessage(msg))}
                    {isTyping && (
                      <p className="text-xs text-gray-500 italic mt-2">
                        Typing...
                      </p>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </main>

              {/* File preview */}
              {selectedFile && (
                <div className="border-t px-6 py-3 bg-gray-100 flex items-center gap-3">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-paperclip-icon lucide-paperclip"
                      >
                        <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="text-gray-500 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              )}

              <footer className="border-t p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-[#3a8dff]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-paperclip-icon lucide-paperclip"
                    >
                      <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#3a8dff]"
                  />
                  <button
                    type="submit"
                    disabled={
                      uploading || (!newMessage.trim() && !selectedFile)
                    }
                    className="bg-[#3a8dff] text-white px-5 py-2 rounded-md hover:bg-[#2f7ae5] disabled:opacity-50"
                  >
                    {uploading ? "Sending..." : "Send"}
                  </button>
                </form>
              </footer>
            </>
          )}
        </section>
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Create New Group
            </h2>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:border-[#3a8dff]"
            />
            <div className="max-h-64 overflow-y-auto border rounded-md p-3 mb-4">
              {allDoctors.map((doc) => (
                <label
                  key={doc._id}
                  className="flex items-center gap-3 py-2 border-b last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={groupMembers.includes(doc._id)}
                    onChange={() => handleToggleMember(doc._id)}
                  />
                  <span className="text-sm text-gray-700">{doc.name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 text-sm bg-[#3a8dff] text-white rounded-md hover:bg-[#2f7ae5]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorChat;
