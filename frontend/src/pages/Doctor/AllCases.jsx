import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";
import ReportModal from "./ReportModal";

const AllCases = () => {
  const { casesData, getCasesData, submitCaseReport, dToken } =
    useContext(DoctorContext);

  const [selectedCase, setSelectedCase] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    if (dToken) getCasesData();
  }, [dToken]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    const res = await submitCaseReport(selectedCase._id, data);
    setIsSubmitting(false);

    if (res.success) setShowReportModal(false);
  };

  // Helper function to get priority badge color
  const getPriorityBadge = (caseData) => {
    if (!caseData.aiResult || !caseData.aiResult.predictions) return null;
    
    const topPrediction = caseData.aiResult.predictions[0];
    const label = topPrediction.label.toLowerCase();
    const confidence = topPrediction.confidence;

    if (label.includes('tb') && confidence > 80) {
      return { text: 'HIGH PRIORITY', color: 'bg-red-500' };
    }
    if (label.includes('pneumonia') && confidence > 80) {
      return { text: 'PRIORITY', color: 'bg-orange-500' };
    }
    return null;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 w-full max-w-full">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-full">
        <div className="px-6 py-4 border-b flex items-center gap-2.5">
          <img src={assets.list_icon} alt="" />
          <p className="font-semibold">All Cases ({casesData?.length || 0})</p>
        </div>

        {!casesData || casesData.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No cases found</p>
        ) : (
          <div className="p-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 w-full max-w-full">
            {casesData.map((item) => {
              const priorityBadge = getPriorityBadge(item);
              
              return (
                <div
                  key={item._id}
                  className={`rounded-2xl border ${
                    priorityBadge ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-100'
                  } hover:shadow-md transition-all bg-white`}
                >
                  {/* Priority Badge */}
                  {priorityBadge && (
                    <div className={`${priorityBadge.color} text-white text-xs font-bold px-3 py-1 rounded-t-2xl text-center`}>
                      {priorityBadge.text}
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-14 h-14 rounded-full object-cover border cursor-pointer"
                        src={item.imageUrl}
                        alt=""
                        onClick={() => setExpandedImage(item.imageUrl)}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          {item.patientId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* AI Analysis Section */}
                    {item.aiResult && item.aiResult.predictions && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          AI Analysis
                        </p>
                        {item.aiResult.predictions.slice(0, 2).map((pred, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs mb-1">
                            <span className={`font-semibold ${idx === 0 ? 'text-gray-800' : 'text-gray-600'}`}>
                              {pred.label}
                            </span>
                            <span className={`font-bold ${
                              pred.confidence > 80 ? 'text-red-600' : 
                              pred.confidence > 50 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {pred.confidence.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs font-semibold text-gray-600 mt-3">
                      Patient History
                    </p>
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {item.patientHistory}
                    </p>
                  </div>

                  <div className="px-4 pb-4 flex flex-col gap-2">
                    <button
                      disabled={item.status === "reviewed"}
                      onClick={() => {
                        setSelectedCase(item);
                        setShowReportModal(true);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-sm font-medium ${
                        item.status === "reviewed"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-[#3a8dff] text-white hover:bg-[#3a8dff]/90"
                      }`}
                    >
                      {item.status === "reviewed"
                        ? "Report Submitted"
                        : "Provide Report"}
                    </button>

                    {item.status === "reviewed" && item.report && (
                      <button
                        onClick={() => {
                          setSelectedCase(item);
                          setShowReviewModal(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
                      >
                        See Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REPORT MODAL */}
      {showReportModal && selectedCase && (
        <ReportModal
          caseData={selectedCase}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onClose={() => setShowReportModal(false)}
          onImageClick={setExpandedImage}
        />
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && selectedCase && selectedCase.report && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Medical Report Review
                </h2>
                <p className="text-sm text-gray-600">
                  Patient ID: {selectedCase.patientId}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex gap-4 items-start">
                <img
                  src={selectedCase.imageUrl}
                  alt="Case"
                  className="w-24 h-24 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-all"
                  onClick={() => setExpandedImage(selectedCase.imageUrl)}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">Patient History</p>
                  <p className="text-sm text-gray-800">{selectedCase.patientHistory}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {new Date(selectedCase.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[50vh]">
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800">
                    {selectedCase.report.diagnosis}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Clinical Findings</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800">
                    {selectedCase.report.findings}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendations</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800">
                    {selectedCase.report.recommendations}
                  </div>
                </div>

                {selectedCase.report.medications && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medications</label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800">
                      {selectedCase.report.medications}
                    </div>
                  </div>
                )}

                {selectedCase.report.followUp && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Follow-up Instructions</label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-800">
                      {selectedCase.report.followUp}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Report submitted on: {selectedCase.report.submittedAt
                      ? new Date(selectedCase.report.submittedAt).toLocaleString()
                      : "Recently"}
                  </p>
                </div>
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

      {/* EXPANDED IMAGE MODAL */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-4xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
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

export default AllCases;