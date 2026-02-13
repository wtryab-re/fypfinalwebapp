import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";

const ReviewedCases = () => {
  const { myCases, getCasesData, dToken, profileData } =
    useContext(DoctorContext);

  const [selectedCase, setSelectedCase] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false); // NEW: AI modal state
  const [expandedImage, setExpandedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCases, setFilteredCases] = useState([]);

  useEffect(() => {
    if (dToken) getCasesData();
  }, [dToken]);

  // Filter reviewed cases from myCases
  useEffect(() => {
    if (myCases) {
      console.log("🔍 Filtering reviewed cases from myCases...");
      console.log("Total my cases:", myCases.length);

      const reviewedCases = myCases.filter(
        (caseItem) => caseItem.status === "reviewed",
      );

      console.log("✅ Found", reviewedCases.length, "reviewed cases");

      const searched = reviewedCases.filter(
        (c) =>
          c.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.report?.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      setFilteredCases(searched);
    }
  }, [myCases, searchTerm]);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 w-full max-w-full">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div>
              <p className="font-semibold text-lg text-gray-800">
                Reviewed Cases ({filteredCases.length})
              </p>
              <p className="text-sm text-gray-500">All cases reviewed by you</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by Patient ID or Diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3a8dff]/20 focus:border-[#3a8dff] outline-none"
            />
          </div>
        </div>

        {/* Table */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? "No reviewed cases found"
                : "You have not reviewed any cases yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Diagnosis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Key Findings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Submitted On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    View Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    View AI Report
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`border-b hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 align-middle">
                      {item.patientId}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 align-middle">
                      {item.report?.diagnosis || "—"}
                    </td>

                    {/*  Fixed alignment for Key Findings */}
                    <td className="px-6 py-4 text-sm text-gray-600 align-middle max-w-[300px] whitespace-pre-wrap">
                      <div className="line-clamp-2 leading-snug">
                        {item.report?.findings || "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap align-middle">
                      {formatDate(item.report?.submittedAt || item.createdAt)}
                    </td>

                    <td className="px-6 py-4 align-middle">
                      <img
                        src={item.imageUrl}
                        alt="case"
                        className="w-14 h-14 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition"
                        onClick={() => setExpandedImage(item.imageUrl)}
                      />
                    </td>

                    <td className="px-6 py-4 align-middle">
                      <button
                        onClick={() => {
                          setSelectedCase(item);
                          setShowReviewModal(true);
                        }}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                      >
                        View Report
                      </button>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {item.aiResult ? (
                        <button
                          onClick={() => {
                            setSelectedCase(item);
                            setShowAIModal(true);
                          }}
                          className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
                        >
                          View AI Report
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">
                          AI Report Not Available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReviewModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-green-50 to-green-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Medical Report
                </h2>
                <p className="text-sm text-gray-600">
                  Patient ID: {selectedCase.patientId}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
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

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[75vh] p-6 space-y-6">
              <div className="flex gap-4 items-start">
                <img
                  src={selectedCase.imageUrl}
                  alt="Case"
                  className="w-28 h-28 rounded-lg object-cover border cursor-pointer"
                  onClick={() => setExpandedImage(selectedCase.imageUrl)}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Patient History
                  </p>
                  <p className="text-sm text-gray-800">
                    {selectedCase.patientHistory}
                  </p>
                </div>
              </div>

              {[
                "diagnosis",
                "findings",
                "recommendations",
                "medications",
                "followUp",
              ].map(
                (field) =>
                  selectedCase.report?.[field] && (
                    <div key={field}>
                      <p className="text-sm font-semibold text-gray-700 mb-1 capitalize">
                        {field === "followUp"
                          ? "Follow-up Instructions"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </p>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800">
                        {selectedCase.report[field]}
                      </div>
                    </div>
                  ),
              )}

              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Reviewed by:</span> Dr.{" "}
                  {profileData?.name}
                </p>
                <p>
                  <span className="font-semibold">Report Submitted:</span>{" "}
                  {formatDate(selectedCase.report.submittedAt)}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-2.5 bg-[#3a8dff] text-white rounded-xl hover:bg-[#3a8dff]/90 transition-all font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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

      {/* Expanded Image */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all z-10"
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
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewedCases;
