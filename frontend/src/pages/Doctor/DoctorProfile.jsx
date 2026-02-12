import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData } =
    useContext(DoctorContext);
  const { currency, backendUrl } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);

  const getInitials = (name) => {
    if (!name) return "DR";
    const names = name.split(" ");
    return names.length === 1
      ? names[0].charAt(0).toUpperCase()
      : (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-red-500",
      "bg-yellow-500",
    ];
    return colors[name ? name.charCodeAt(0) % colors.length : 0];
  };

  const updateProfile = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        {
          address: profileData.address,
          fees: profileData.fees,
          about: profileData.about,
          available: profileData.available,
        },
        { headers: { dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (dToken) getProfileData();
  }, [dToken]);

  if (!profileData) return null;

  return (
    <div className="max-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row items-center gap-5 relative">
          {/* Buttons top-right */}
          <div className="absolute top-3 right-3 flex gap-2">
            {isEdit ? (
              <>
                <button
                  onClick={() => setIsEdit(false)}
                  className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={updateProfile}
                  className="px-3 py-1 bg-[#3a8dff] text-white rounded hover:bg-[#3a8dff]/90 text-sm"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="px-3 py-1 bg-[#3a8dff] text-white rounded hover:bg-[#3a8dff]/90 text-sm w-20 flex items-center justify-center gap-1"
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
                  class="lucide lucide-user-round-pen-icon lucide-user-round-pen"
                >
                  <path d="M2 21a8 8 0 0 1 10.821-7.487" />
                  <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                  <circle cx="10" cy="8" r="5" />
                </svg>
                Edit
              </button>
            )}
          </div>

          {/* Avatar */}
          {profileData.image ? (
            <img
              src={profileData.image}
              alt={profileData.name}
              className="w-24 h-24 rounded-full object-cover cursor-pointer"
              onClick={() => setExpandedImage(profileData.image)}
            />
          ) : (
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold ${getAvatarColor(
                profileData.name
              )}`}
            >
              {getInitials(profileData.name)}
            </div>
          )}

          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-xl font-bold text-gray-800">
              {profileData.name}
            </h1>
            <p className="text-sm text-gray-500">{profileData.speciality}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              <div className="bg-gray-50 p-3 rounded shadow-sm text-sm text-gray-700">
                <span className="block text-xs text-gray-400 uppercase">
                  Qualification
                </span>
                <p className="font-semibold mt-1">{profileData.degree}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded shadow-sm text-sm text-gray-700">
                <span className="block text-xs text-gray-400 uppercase">
                  Experience
                </span>
                <p className="font-semibold mt-1">{profileData.experience}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                About
              </h2>
              {isEdit ? (
                <textarea
                  rows={4}
                  value={profileData.about}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      about: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3a8dff]"
                  placeholder="Write something about yourself..."
                />
              ) : (
                <p className="text-gray-600 text-sm">{profileData.about}</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
              <span className="text-gray-700 text-sm">Availability</span>
              <label className="inline-flex relative items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.available}
                  disabled={!isEdit}
                  className="sr-only peer"
                  onChange={() =>
                    setProfileData((prev) => ({
                      ...prev,
                      available: !prev.available,
                    }))
                  }
                />
                <div
                  className={`w-10 h-5 rounded-full ${
                    profileData.available ? "bg-green-500" : "bg-gray-300"
                  } relative after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5`}
                ></div>
              </label>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                Consultation Fee
              </h2>
              <span className="text-lg font-bold text-[#3a8dff]">
                {currency}
                {profileData.fees}
              </span>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                Address
              </h2>
              {isEdit ? (
                <>
                  <input
                    type="text"
                    value={profileData.address.line1}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                    className="w-full p-2 mb-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3a8dff]"
                    placeholder="Address Line 1"
                  />
                  <input
                    type="text"
                    value={profileData.address.line2}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3a8dff]"
                    placeholder="Address Line 2"
                  />
                </>
              ) : (
                <p className="text-gray-600 text-sm">
                  {profileData.address.line1}
                  <br />
                  {profileData.address.line2}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {expandedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setExpandedImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 bg-white rounded hover:bg-gray-100"
              onClick={() => setExpandedImage(null)}
            >
              ✕
            </button>
            <img
              src={expandedImage}
              alt="Full view"
              className="max-w-full max-h-full rounded-lg object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
