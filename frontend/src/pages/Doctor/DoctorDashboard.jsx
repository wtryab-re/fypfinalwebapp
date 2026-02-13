import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import ReportModal from "./ReportModal";

const DoctorDashboard = () => {
  const {
    dToken,
    dashData,
    getDashData,
    availableCases,
    myCases,
    rejectedCases,
    getCasesData,
    submitCaseReport,
    acceptCase,
    rejectCase,
    profileData,
  } = useContext(DoctorContext);

  const [selectedCase, setSelectedCase] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedImage, setExpandedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("available"); // "available", "myCases", or "rejected"
  const [processingCaseId, setProcessingCaseId] = useState(null); // Track which case is being processed

  useEffect(() => {
    if (dToken) {
      getDashData();

      // Load profile first, then cases will be loaded automatically
      // when profileData changes (see next useEffect)
      if (!profileData) {
        // Profile will be loaded by parent component or another effect
      }
    }
  }, [dToken]);

  // Load cases when profileData becomes available
  useEffect(() => {
    if (dToken && profileData) {
      console.log("✅ ProfileData loaded, fetching cases...");
      getCasesData();
    }
  }, [dToken, profileData]);

  // Get current cases based on active tab
  const currentCases =
    activeTab === "available"
      ? availableCases
      : activeTab === "myCases"
        ? myCases
        : rejectedCases;

  // Prioritize and filter cases (already prioritized from backend, just filter by search)
  const filteredCases = (
    currentCases.filter((c) =>
      c.patientId?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []
  ).slice(0, 10);

  // Auto-select first case when switching tabs or cases change
  useEffect(() => {
    if (!selectedCase && filteredCases.length) {
      setSelectedCase(filteredCases[0]);
    } else if (
      selectedCase &&
      !filteredCases.find((c) => c._id === selectedCase._id)
    ) {
      // If selected case is no longer in the list, select first one
      setSelectedCase(filteredCases[0] || null);
    }
  }, [filteredCases, activeTab]);

  const handleSubmitReport = async (reportData) => {
    setIsSubmitting(true);
    const result = await submitCaseReport(selectedCase._id, reportData);
    setIsSubmitting(false);
    if (result.success) setShowReportModal(false);
  };

  const handleAcceptCase = async (caseId, e) => {
    e.stopPropagation(); // Prevent card selection
    setProcessingCaseId(caseId);
    const result = await acceptCase(caseId);
    setProcessingCaseId(null);

    if (result.success) {
      // Switch to "My Cases" tab and select the accepted case
      setActiveTab("myCases");
      setSelectedCase(result.case);
    }
  };

  const handleRejectCase = async (caseId, e) => {
    e.stopPropagation(); // Prevent card selection
    setProcessingCaseId(caseId);
    await rejectCase(caseId);
    setProcessingCaseId(null);

    // If this was the selected case, clear selection
    if (selectedCase?._id === caseId) {
      setSelectedCase(null);
    }
  };

  // Get priority badge
  const getPriorityBadge = (caseData) => {
    if (!caseData.aiResult || !caseData.aiResult.predictions) return null;

    const topPrediction = caseData.aiResult.predictions[0];
    const label = topPrediction.label.toLowerCase();
    const confidence = topPrediction.confidence;

    if (label.includes("tb") && confidence > 80) {
      return { text: "HIGH PRIORITY", color: "bg-red-500", icon: "🚨" };
    }
    if (label.includes("pneumonia") && confidence > 80) {
      return { text: "PRIORITY", color: "bg-orange-500", icon: "⚠️" };
    }
    return null;
  };

  if (!dashData) return null;

  const totalAvailable = availableCases?.length || 0;
  const totalMyCases = myCases?.length || 0;
  const totalRejected = rejectedCases?.length || 0;
  const totalReviewed =
    myCases?.filter((c) => c.status === "reviewed")?.length || 0;

  const priorityBadge = selectedCase ? getPriorityBadge(selectedCase) : null;

  return (
    <div className="flex flex-col px-6 py-6 sm:px-8 lg:px-12 space-y-6">
      {/* Welcome & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <h1 className="text-2xl font-semibold text-[#175dbf]">
          Welcome back, Dr. {profileData?.name || "Doctor"}
        </h1>
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white border border-gray-200 rounded-lg shadow p-4 w-40">
            <p className="text-gray-500 text-sm">Pending Cases</p>
            <p className="text-xl font-bold text-gray-800">{totalAvailable}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow p-4 w-40">
            <p className="text-gray-500 text-sm">My Cases</p>
            <p className="text-xl font-bold text-gray-800">{totalMyCases}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow p-4 w-40">
            <p className="text-gray-500 text-sm">Rejected Cases</p>
            <p className="text-xl font-bold text-gray-800">{totalRejected}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow p-4 w-40">
            <p className="text-gray-500 text-sm">Reviewed Cases</p>
            <p className="text-xl font-bold text-gray-800">{totalReviewed}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="flex flex-col lg:flex-row h-full gap-6">
        {/* Left Sidebar - Cases with Tabs */}
        <div className="w-full lg:w-1/3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("available")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                activeTab === "available"
                  ? "bg-white text-[#3a8dff] border-b-2 border-[#3a8dff]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Pending Cases ({totalAvailable})
            </button>
            <button
              onClick={() => setActiveTab("myCases")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                activeTab === "myCases"
                  ? "bg-white text-[#3a8dff] border-b-2 border-[#3a8dff]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              My Cases ({totalMyCases})
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                activeTab === "rejected"
                  ? "bg-white text-[#3a8dff] border-b-2 border-[#3a8dff]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Rejected ({totalRejected})
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search by Patient ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3a8dff] focus:border-[#3a8dff]"
            />
          </div>

          {/* Cases List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {!currentCases.length ? (
              <p className="text-gray-500 text-center py-6">
                {activeTab === "available"
                  ? "No available cases."
                  : activeTab === "myCases"
                    ? "No assigned cases."
                    : "No rejected cases."}
              </p>
            ) : filteredCases.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No cases found for "{searchTerm}"
              </p>
            ) : (
              filteredCases.map((c) => {
                const badge = getPriorityBadge(c);
                const isProcessing = processingCaseId === c._id;

                return (
                  <div
                    key={c._id}
                    onClick={() => setSelectedCase(c)}
                    className={`w-full flex flex-col gap-2 px-3 py-2 rounded border transition duration-200 cursor-pointer ${
                      selectedCase?._id === c._id
                        ? "border-[#3a8dff] bg-white ring-2 ring-[#3a8dff]"
                        : badge
                          ? "border-red-300 bg-white ring-1 ring-red-200 hover:ring-2"
                          : "border-gray-200 hover:ring-1 hover:ring-gray-300 bg-white"
                    }`}
                  >
                    {/* Priority Badge */}
                    {badge && (
                      <div
                        className={`${badge.color} text-white text-xs font-bold px-2 py-1 rounded text-center`}
                      >
                        {badge.icon} {badge.text}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <img
                        src={c.imageUrl || assets.people_icon}
                        alt="case"
                        className="w-12 h-12 object-cover border border-gray-300 rounded"
                      />
                      <div className="flex-1 text-left">
                        <p className="text-gray-800 font-medium truncate">
                          {c.patientId.slice(-8)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(c.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* AI Preview */}
                    {c.aiResult && c.aiResult.predictions && (
                      <div className="text-xs bg-blue-50 px-2 py-1 rounded">
                        <span className="font-semibold text-gray-700">
                          {c.aiResult.predictions[0].label}
                        </span>
                        <span className="text-gray-600 ml-2">
                          {c.aiResult.predictions[0].confidence.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {/* Accept/Reject Buttons - Only for Available Cases */}
                    {activeTab === "available" && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => handleAcceptCase(c._id, e)}
                          disabled={isProcessing}
                          className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded transition ${
                            isProcessing
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {isProcessing ? "Processing..." : "✓ Accept"}
                        </button>
                        <button
                          onClick={(e) => handleRejectCase(c._id, e)}
                          disabled={isProcessing}
                          className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded transition ${
                            isProcessing
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        >
                          {isProcessing ? "Processing..." : "✗ Reject"}
                        </button>
                      </div>
                    )}

                    {/* Status Badge - Only for My Cases */}
                    {activeTab === "myCases" && (
                      <div className="mt-2">
                        {c.status === "reviewed" ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                            ✓ Reviewed
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold">
                            ⏳ Pending Review
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status Badge - Only for Rejected Cases */}
                    {activeTab === "rejected" && (
                      <div className="mt-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                          ✗ Rejected
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Case Details */}
        <div className="w-full lg:w-2/3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm px-6 py-6 flex flex-col">
          {selectedCase ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  {priorityBadge && (
                    <div
                      className={`${priorityBadge.color} text-white text-sm font-bold px-3 py-1 rounded mb-2 inline-block`}
                    >
                      {priorityBadge.icon} {priorityBadge.text}
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    Case: {selectedCase.patientId}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Submitted on:{" "}
                    {new Date(selectedCase.createdAt).toLocaleString()}
                  </p>
                </div>
                {activeTab === "myCases" &&
                  selectedCase.status !== "reviewed" && (
                    <div className="flex gap-3">
                      {selectedCase.aiResult && (
                        <button
                          onClick={() => setShowAIModal(true)}
                          className="px-4 py-2 bg-[#9D00FF] text-white font-medium text-sm rounded hover:bg-[#9D00FF]/70 transition"
                        >
                          View AI Analysis
                        </button>
                      )}
                      <button
                        onClick={() => setShowReportModal(true)}
                        className="px-4 py-2 bg-[#3a8dff] text-white font-medium text-sm rounded hover:bg-[#3a8dff]/80 transition"
                      >
                        Provide Report
                      </button>
                    </div>
                  )}
                {activeTab === "myCases" &&
                  selectedCase.status === "reviewed" && (
                    <span className="px-4 py-2 bg-green-500 text-white font-semibold text-sm rounded">
                      ✓ Report Submitted
                    </span>
                  )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-gray-700 font-medium mb-1">
                      Patient Symptoms
                    </h3>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {selectedCase.patientHistory}
                    </p>
                  </div>

                  {/* AI Analysis Preview */}
                  {selectedCase.aiResult &&
                    selectedCase.aiResult.predictions && (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="text-gray-800 font-semibold text-lg mb-3 flex items-center gap-2">
                          <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                          AI Analysis Summary
                        </h3>
                        <div className="space-y-2">
                          {selectedCase.aiResult.predictions
                            .slice(0, 3)
                            .map((pred, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center"
                              >
                                <span className="text-sm font-semibold text-gray-700">
                                  {pred.label}
                                </span>
                                <span
                                  className={`text-sm font-bold ${
                                    pred.confidence > 80
                                      ? "text-red-600"
                                      : pred.confidence > 50
                                        ? "text-orange-600"
                                        : "text-green-600"
                                  }`}
                                >
                                  {pred.confidence.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                        </div>
                        <button
                          onClick={() => setShowAIModal(true)}
                          className="mt-3 text-sm text-purple-700 hover:text-purple-900 font-medium"
                        >
                          View Full AI Report →
                        </button>
                      </div>
                    )}

                  {selectedCase.status === "reviewed" &&
                    selectedCase.report && (
                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-gray-800 font-semibold text-lg mb-2">
                          Medical Report Summary
                        </h3>
                        <div className="bg-white border border-gray-200 rounded p-4 space-y-3">
                          {[
                            "diagnosis",
                            "findings",
                            "recommendations",
                            "medications",
                            "followUp",
                          ].map(
                            (field) =>
                              selectedCase.report[field] && (
                                <div key={field}>
                                  <p className="text-gray-600 font-medium text-sm mb-1">
                                    {field === "followUp"
                                      ? "Follow-up Instructions"
                                      : field.charAt(0).toUpperCase() +
                                        field.slice(1)}
                                  </p>
                                  <p className="text-gray-800 text-sm">
                                    {selectedCase.report[field]}
                                  </p>
                                </div>
                              ),
                          )}
                          <p className="text-gray-500 text-xs pt-2 border-t border-gray-200">
                            Report submitted on:{" "}
                            {selectedCase.report.submittedAt
                              ? new Date(
                                  selectedCase.report.submittedAt,
                                ).toLocaleString()
                              : "Recently"}
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex justify-center items-start">
                  <img
                    src={selectedCase.imageUrl || assets.people_icon}
                    alt="Case preview"
                    className="w-full max-h-96 object-cover border border-gray-300 cursor-pointer rounded hover:opacity-90 transition"
                    onClick={() => setExpandedImage(selectedCase.imageUrl)}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {searchTerm && filteredCases.length === 0
                ? `No cases found for "${searchTerm}"`
                : activeTab === "available"
                  ? "Select a case from available cases to preview."
                  : activeTab === "myCases"
                    ? "Select a case from your assigned cases to preview."
                    : "Select a case from rejected cases to preview."}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal - Only show for My Cases */}
      {showReportModal && selectedCase && activeTab === "myCases" && (
        <ReportModal
          caseData={selectedCase}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSubmitReport}
          isSubmitting={isSubmitting}
          onImageClick={setExpandedImage}
        />
      )}

      {/* AI Analysis Modal */}
      {showAIModal && selectedCase && selectedCase.aiResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  AI Analysis Report
                </h2>
                <p className="text-sm text-gray-600">
                  Patient ID: {selectedCase.patientId}
                </p>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
              {/* Images Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Original X-Ray
                  </h3>
                  <img
                    src={selectedCase.imageUrl}
                    alt="X-ray"
                    className="w-full h-64 object-cover border rounded-lg cursor-pointer hover:opacity-80"
                    onClick={() => setExpandedImage(selectedCase.imageUrl)}
                  />
                </div>
                {selectedCase.aiResult.heatmapUrl && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      AI Attention Map (Grad-CAM)
                    </h3>
                    <img
                      src={selectedCase.aiResult.heatmapUrl}
                      alt="Heatmap"
                      className="w-full h-64 object-cover border rounded-lg cursor-pointer hover:opacity-80"
                      onClick={() =>
                        setExpandedImage(selectedCase.aiResult.heatmapUrl)
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Highlighted areas show AI focus regions
                    </p>
                  </div>
                )}
              </div>

              {/* Predictions */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  AI Predictions
                </h3>
                <div className="space-y-3">
                  {selectedCase.aiResult.predictions.map((pred, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-semibold text-gray-800">
                          {pred.label}
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            pred.confidence > 80
                              ? "text-red-600"
                              : pred.confidence > 50
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {pred.confidence.toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            pred.confidence > 80
                              ? "bg-red-500"
                              : pred.confidence > 50
                                ? "bg-orange-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${pred.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Checks */}
              {selectedCase.aiResult.qcResults && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Quality Checks
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(selectedCase.aiResult.qcResults).map(
                      ([key, value]) =>
                        key !== "qc_pass" && (
                          <div
                            key={key}
                            className={`p-3 rounded-lg ${value ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                {key.replace("_", " ").charAt(0).toUpperCase() +
                                  key.replace("_", " ").slice(1)}
                              </span>
                              <span
                                className={`text-sm font-bold ${value ? "text-green-700" : "text-red-700"}`}
                              >
                                {value ? "✓ Pass" : "✗ Fail"}
                              </span>
                            </div>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}

              {/* Model Info */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Model:{" "}
                  {selectedCase.aiResult.modelVersion || "MobileNetV2-v1"}
                </p>
                <p className="text-sm text-gray-600">
                  Processed:{" "}
                  {selectedCase.aiResult.processedAt
                    ? new Date(
                        selectedCase.aiResult.processedAt,
                      ).toLocaleString()
                    : "Recently"}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-5 py-2.5 bg-[#3a8dff] text-white rounded-xl hover:bg-[#3a8dff]/90 transition-all font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition z-10"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            className="max-w-4xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={expandedImage}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain border rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
