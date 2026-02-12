import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

// ✅ Unified Tailwind CSS for consistent badge size
const getStatusClasses = (status) => {
  const baseClasses =
    "inline-flex items-center justify-center w-[90px] px-3 py-1 text-xs font-semibold rounded-full border text-center";
  if (status === "reviewed") {
    return `${baseClasses} bg-green-100 text-green-700 border-green-200`;
  } else if (status === "pending") {
    return `${baseClasses} bg-yellow-100 text-yellow-700 border-yellow-200`;
  }
  return `${baseClasses} bg-gray-100 text-gray-700 border-gray-200`;
};

// Function to truncate text and show tooltip on hover
const TruncatedText = ({ text, length = 80 }) => (
  <span
    title={text}
    className="block max-w-[600px] overflow-hidden whitespace-nowrap text-ellipsis"
  >
    {text}
  </span>
);

const AdminCases = () => {
  const { cases, aToken, getAllCases } = useContext(AdminContext);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState(null); // NEW: Selected case for AI modal
  const [showAIModal, setShowAIModal] = useState(false); // NEW: AI modal state
  const [expandedImage, setExpandedImage] = useState(null); // NEW: Expanded image state

  useEffect(() => {
    if (aToken) {
      getAllCases();
    }
  }, [aToken]);

  // Tabs
  const tabs = [
    { id: "all", label: "All Cases", count: cases?.length || 0 },
    {
      id: "reviewed",
      label: "Reviewed",
      count: cases?.filter((c) => c.status === "reviewed").length || 0,
    },
    {
      id: "pending",
      label: "Pending",
      count: cases?.filter((c) => c.status === "pending").length || 0,
    },
  ];

  // Filter cases by tab and search
  const filteredCases =
    cases?.filter((caseItem) => {
      const matchesSearch =
        caseItem.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem._id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "all" || caseItem.status === activeTab;
      return matchesSearch && matchesTab;
    }) || [];

  return (
    <div className="m-5 overflow-y-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">All Cases</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 bg-white p-3 rounded-xl shadow-sm border w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.id
                ? "bg-[#3a8dff] text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <input
          type="text"
          placeholder="Search by Case ID or Patient ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#3a8dff] transition-all"
        />
        <p className="text-sm text-gray-600 mt-3">
          Displaying {filteredCases.length} cases in the{" "}
          {activeTab.toUpperCase()} category.
        </p>
      </div>

      {/* All Cases Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto border">
        <table className="min-w-max divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase">
                Case ID
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase">
                Patient ID
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase">
                Status
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase">
                Submission Date
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase w-[300px]">
                Patient History
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase w-[300px]">
                Doctor Name
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase w-[400px]">
                Diagnosis
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase w-[400px]">
                Findings
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase w-[400px]">
                Recommendations
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase w-[300px]">
                Medications
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase w-[300px]">
                Follow-up
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase w-[200px]">
                X-ray
              </th>
              <th className="px-6 py-3 min-w-[160px] text-left font-semibold text-gray-600 uppercase w-[200px]">
                AI REPORT
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredCases.length > 0 ? (
              filteredCases.map((caseItem) => (
                <tr
                  key={caseItem._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-700">{caseItem._id}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {caseItem.patientId}
                  </td>
                  <td className="px-6 py-4">
                    <span className={getStatusClasses(caseItem.status)}>
                      {caseItem.status.charAt(0).toUpperCase() +
                        caseItem.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    <TruncatedText text={caseItem.patientHistory || "N/A"} />
                  </td>

                  {caseItem.status === "reviewed" && caseItem.report ? (
                    <>
                      <td className="px-6 py-4 text-gray-700">
                        {caseItem.report.doctorName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <TruncatedText
                          text={caseItem.report.diagnosis || "N/A"}
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <TruncatedText
                          text={caseItem.report.findings || "N/A"}
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <TruncatedText
                          text={caseItem.report.recommendations || "N/A"}
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {caseItem.report.medications || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {caseItem.report.followUp || "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-gray-500">—</td>
                      <td className="px-6 py-4 text-gray-500">—</td>
                      <td className="px-6 py-4 text-gray-500">—</td>
                      <td className="px-6 py-4 text-gray-500">—</td>
                      <td className="px-6 py-4 text-gray-500">—</td>
                      <td className="px-6 py-4 text-gray-500">—</td>
                    </>
                  )}

                  <td className="px-6 py-4">
                    {caseItem.imageUrl ? (
                      <a
                        href={caseItem.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View X-ray
                      </a>
                    ) : (
                      <span className="text-gray-400">No X-ray</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {caseItem.aiResult ? (
                      <button
                        onClick={() => {
                          setSelectedCase(caseItem);
                          setShowAIModal(true);
                        }}
                        className="text-purple-600 hover:underline font-medium"
                      >
                        View AI Report
                      </button>
                    ) : (
                      <span className="text-gray-400">No AI Report</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="text-center py-10 text-gray-500">
                  No cases found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* AI Analysis Modal */}
      {showAIModal && selectedCase && selectedCase.aiResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">AI Analysis Report</h2>
                <p className="text-sm text-gray-600">Patient ID: {selectedCase.patientId}</p>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
              {/* Images Section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Original X-Ray</h3>
                  <img
                    src={selectedCase.imageUrl}
                    alt="X-ray"
                    className="w-full h-64 object-cover border rounded-lg cursor-pointer hover:opacity-80"
                    onClick={() => setExpandedImage(selectedCase.imageUrl)}
                  />
                </div>
                {selectedCase.aiResult.heatmapUrl && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">AI Attention Map (Grad-CAM)</h3>
                    <img
                      src={selectedCase.aiResult.heatmapUrl}
                      alt="Heatmap"
                      className="w-full h-64 object-cover border rounded-lg cursor-pointer hover:opacity-80"
                      onClick={() => setExpandedImage(selectedCase.aiResult.heatmapUrl)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Highlighted areas show AI focus regions</p>
                  </div>
                )}
              </div>

              {/* Predictions */}
              {selectedCase.aiResult.predictions && selectedCase.aiResult.predictions.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">AI Predictions</h3>
                  <div className="space-y-3">
                    {selectedCase.aiResult.predictions.map((pred, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-base font-semibold text-gray-800">{pred.label}</span>
                          <span className={`text-lg font-bold ${
                            pred.confidence > 80 ? 'text-red-600' : 
                            pred.confidence > 50 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {pred.confidence.toFixed(2)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              pred.confidence > 80 ? 'bg-red-500' : 
                              pred.confidence > 50 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${pred.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">AI Predictions</h3>
                  <p className="text-gray-500 text-center py-4">No predictions available</p>
                </div>
              )}

              {/* Quality Checks */}
              {selectedCase.aiResult.qcResults && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Quality Checks</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(selectedCase.aiResult.qcResults).map(([key, value]) => 
                      key !== 'qc_pass' && (
                        <div key={key} className={`p-3 rounded-lg ${value ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}
                            </span>
                            <span className={`text-sm font-bold ${value ? 'text-green-700' : 'text-red-700'}`}>
                              {value ? '✓ Pass' : '✗ Fail'}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Model Info */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Model: {selectedCase.aiResult.modelVersion || 'MobileNetV2-v1'}
                </p>
                <p className="text-sm text-gray-600">
                  Processed: {selectedCase.aiResult.processedAt 
                    ? new Date(selectedCase.aiResult.processedAt).toLocaleString()
                    : 'Recently'}
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

      {/* Expanded Image Modal */}
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

export default AdminCases;