import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { useEffect } from "react";
import debounce from "lodash.debounce";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("250");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [regNo, setRegNo] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [licenseStatus, setLicenseStatus] = useState("");
  const [isVerified, setisVerified] = useState(false);
  const [responsedata, setresponsedata] = useState("");

  const { backendUrl } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // If PMDC is not verified, ask the admin first
    if (!isVerified) {
      const confirmProceed = window.confirm(
        "⚠️ This doctor is not PMDC verified.\n\nAre you sure you want to add them anyway?",
      );
      if (!confirmProceed) {
        toast.info("Submission cancelled.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      if (docImg) formData.append("image", docImg);
      if (certificate) formData.append("certificate", certificate);

      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("fees", Number(fees) || 0);
      formData.append("about", about);
      formData.append("speciality", speciality);
      formData.append("degree", degree);
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 }),
      );

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        { headers: { aToken } },
      );

      if (data.success) {
        toast.success(
          isVerified
            ? "Doctor added successfully (PMDC verified ✅)"
            : "Doctor added successfully (not PMDC verified ⚠️)",
        );

        // Reset form fields
        setDocImg(null);
        setCertificate(null);
        setName("");
        setPassword("");
        setEmail("");
        setAddress1("");
        setAddress2("");
        setDegree("");
        setAbout("");
        setFees("250");
        setExperience("1 Year");
        setSpeciality("General physician");
        setShowPassword(false);
        setRegNo("");
        setFatherName("");
        setLicenseStatus("");
        setisVerified(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "An error occurred during submission.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const doctorVerification = async (reg, fullName, father) => {
    if (!reg || !fullName || !father) {
      setisVerified(false);
      setLicenseStatus("");
      return;
    }

    try {
      const response = await axios.post(
        "https://hospitals-inspections.pmdc.pk/api/DRC/GetData",
        new URLSearchParams({
          RegistrationNo: reg,
          Name: fullName,
          FatherName: father,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        },
      );

      console.log(response.data.data);

      if (
        response?.data &&
        Object.keys(response.data?.data).length === 1 &&
        response.data?.data?.[0]?.Name === name.toUpperCase() &&
        response.data?.data?.[0]?.FatherName === fatherName.toUpperCase() &&
        response.data?.data?.[0]?.RegistrationNo === regNo.toUpperCase()
      ) {
        setisVerified(true);
        setLicenseStatus("This doctor is PMDC Verified");
      } else {
        setisVerified(false);
        setLicenseStatus("This doctor is not PMDC Verified ❌");
      }
    } catch (error) {
      console.error("Error verifying doctor:", error);
      setisVerified(false);
      setLicenseStatus("PMDC Not Verified ❌");
    }
  };

  useEffect(() => {
    const debouncedVerify = debounce(() => {
      if (regNo && name && fatherName) {
        doctorVerification(regNo, name, fatherName);
      }
    }, 1000); // 1 second delay

    debouncedVerify();
    return () => debouncedVerify.cancel();
  }, [regNo, name, fatherName]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Consistent Styling for Inputs and Labels
  const inputStyle = `w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3a8dff]/20 focus:border-[#3a8dff] transition-all outline-none text-gray-800 placeholder-gray-400`;
  const labelStyle = "text-sm font-medium text-gray-700 mb-1 block";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Add New Doctor
          </h1>
          <p className="text-gray-600">
            Enter Details as registered with PMDC and ensure all information is
            accurate for verification.
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className=" overflow-hidden">
          <div className="p-8 space-y-10">
            {/* 1. Documents & Media Upload Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-5">
                Upload Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Certificate Upload */}
                <div>
                  <label className={labelStyle}>
                    Medical License <span className="text-red-500">*</span>
                  </label>
                  <label htmlFor="certificate" className="cursor-pointer">
                    <div className="relative group">
                      <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#3a8dff] transition-all overflow-hidden bg-gray-50">
                        {certificate ? (
                          <div className="w-full h-full relative p-4">
                            {/* Simple icon for PDF or image preview for image files */}
                            <div className="flex flex-col items-center justify-center w-full h-full">
                              <svg
                                className="w-12 h-12 text-[#3a8dff] mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p className="text-gray-700 text-sm font-medium px-2 text-center">
                                File attached: **
                                {certificate.name.substring(0, 20)}...**
                              </p>
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                              <p className="text-white text-sm font-medium">
                                Click to change
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="w-10 h-10 text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <p className="text-gray-500 text-sm font-medium">
                              Click to upload license
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              PNG, JPG, PDF up to 5MB (Required)
                            </p>
                          </>
                        )}
                      </div>
                      {certificate && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setCertificate(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <svg
                            className="w-4 h-4"
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
                      )}
                    </div>
                  </label>
                  <input
                    onChange={(e) => setCertificate(e.target.files[0])}
                    type="file"
                    id="certificate"
                    accept="image/*,.pdf"
                    hidden
                    required
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 2. Personal & Account Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-3">
                  Personal Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={labelStyle}>Full Name</label>
                    <input
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      className={inputStyle}
                      type="text"
                      placeholder="Enter doctor's full name"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Email Address</label>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      className={inputStyle}
                      type="email"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Password</label>
                    <div className="relative">
                      <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className={`${inputStyle} pr-12`}
                        type={showPassword ? "text" : "password"}
                        placeholder="Set account password"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-3">
                  PMDC Verification
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={labelStyle}>Father Name</label>
                    <input
                      onChange={(e) => setFatherName(e.target.value)}
                      value={fatherName}
                      className={inputStyle}
                      type="text"
                      placeholder="Enter doctor's father name"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Registration Number</label>
                    <input
                      onChange={(e) => setRegNo(e.target.value)}
                      value={regNo}
                      className={inputStyle}
                      type="text"
                      placeholder="Enter registration number"
                      required
                    />
                  </div>
                </div>

                {licenseStatus && name && fatherName && regNo && (
                  <p
                    className={`mt-2 text-sm font-medium text-center  ${
                      isVerified ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {licenseStatus}
                  </p>
                )}
              </div>

              {/* 3. Professional Details & Address */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-3">
                  Professional Details & Address
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>Experience</label>
                    <select
                      onChange={(e) => setExperience(e.target.value)}
                      value={experience}
                      className={inputStyle}
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(
                        (year) => (
                          <option
                            key={year}
                            value={`${year} Year${year > 1 ? "s" : ""}`}
                          >
                            {year} Year{year > 1 ? "s" : ""}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelStyle}>Specialization</label>
                    <select
                      onChange={(e) => setSpeciality(e.target.value)}
                      value={speciality}
                      className={inputStyle}
                    >
                      <option value="General physician">
                        General Physician
                      </option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatricians">Pediatrician</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Gastroenterologist">
                        Gastroenterologist
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className={labelStyle}>Medical Degree</label>
                    <input
                      onChange={(e) => setDegree(e.target.value)}
                      value={degree}
                      className={inputStyle}
                      type="text"
                      placeholder="e.g., MBBS, MD, etc."
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Address Information */}
            <div className="space-y-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-3">
                Address Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={labelStyle}>Address Line 1</label>
                  <input
                    onChange={(e) => setAddress1(e.target.value)}
                    value={address1}
                    className={inputStyle}
                    type="text"
                    placeholder="Street address, P.O. box"
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    Address Line 2 (Optional)
                  </label>
                  <input
                    onChange={(e) => setAddress2(e.target.value)}
                    value={address2}
                    className={inputStyle}
                    type="text"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* 5. About Section */}
            <div>
              <label className="text-lg font-semibold text-gray-800 mb-3 block border-b pb-3">
                About Doctor
              </label>
              <textarea
                onChange={(e) => setAbout(e.target.value)}
                value={about}
                className={`${inputStyle} resize-y min-h-[120px]`}
                rows={4}
                placeholder="Write about the doctor's expertise, experience, and approach to patient care..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
              <button
                type="submit"
                disabled={isLoading}
                // Maintaining original button color scheme
                className="bg-gradient-to-r from-[#3a8dff] to-[#3a8dff]/90 text-white px-8 py-3 rounded-xl hover:from-[#3a8dff]/90 hover:to-[#3a8dff] transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding Doctor...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Doctor
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;
