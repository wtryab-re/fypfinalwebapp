import React, { useState } from "react";

const ReportModal = ({
  caseData,
  onClose,
  onSubmit,
  isSubmitting,
  onImageClick,
}) => {
  const [formData, setFormData] = useState({
    diagnosis: "",
    findings: "",
    recommendations: "",
    medications: "",
    followUp: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed h-[100vh] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-[#3a8dff]/5 to-[#3a8dff]/10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Medical Report</h2>
            <p className="text-sm text-gray-600">
              Patient ID: {caseData.patientId}
            </p>
          </div>
          <button
            onClick={onClose}
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

        {/* Case Preview */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex gap-4 items-start">
            <img
              src={caseData.imageUrl}
              alt="Case"
              className="w-24 h-24 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-all"
              onClick={() => onImageClick(caseData.imageUrl)}
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Patient History
              </p>
              <p className="text-sm text-gray-800">{caseData.patientHistory}</p>
              <p className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(caseData.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[50vh]">
          <div className="px-6 py-5 space-y-4">
            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
                rows="2"
                placeholder="Primary diagnosis based on the examination..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3a8dff]/20 focus:border-[#3a8dff] outline-none text-sm"
              />
            </div>

            {/* Findings */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Clinical Findings <span className="text-red-500">*</span>
              </label>
              <textarea
                name="findings"
                value={formData.findings}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Key observations from the examination and imaging..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3a8dff]/20 focus:border-[#3a8dff] outline-none text-sm"
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recommendations <span className="text-red-500">*</span>
              </label>
              <textarea
                name="recommendations"
                value={formData.recommendations}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Treatment plan and care recommendations..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3a8dff]/20 focus:border-[#3a8dff] outline-none text-sm"
              />
            </div>

            {/* Medications */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medications (Optional)
              </label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                rows="2"
                placeholder="Prescribed medications with dosage and duration..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3a8dff]/20 focus:border-[#3a8dff] outline-none text-sm"
              />
            </div>

            {/* Follow-up */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Follow-up Instructions (Optional)
              </label>
              <textarea
                name="followUp"
                value={formData.followUp}
                onChange={handleChange}
                rows="2"
                placeholder="When to return, warning signs to watch for..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3a8dff]/20 focus:border-[#3a8dff] outline-none text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#3a8dff] text-white rounded-xl hover:bg-[#3a8dff]/90 transition-all font-medium text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
