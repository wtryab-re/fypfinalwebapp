import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";

const DoctorList = () => {
  const {
    doctors,
    aToken,
    getAllDoctors,
    deleteDoctorByAdmin,
    cases,
    getAllCases,
  } = useContext(AdminContext);
  const { currency } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedDoctors, setSelectedDoctors] = useState([]);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
      getAllCases();
    }
  }, [aToken]);

  const specialties = [
    "all",
    ...new Set(doctors?.map((doc) => doc.speciality) || []),
  ];

  const filteredDoctors =
    doctors?.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty =
        selectedSpecialty === "all" || doctor.speciality === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    }) || [];

  const getDoctorCases = (doctorId, doctorEmail, doctorName) => {
    if (!cases) return [];
    return cases.filter((caseItem) => {
      if (caseItem.status !== "reviewed" || !caseItem.report) return false;
      return (
        caseItem.report.doctorId === doctorId ||
        caseItem.report.doctorEmail === doctorEmail ||
        caseItem.report.doctorName === doctorName ||
        caseItem.doctorId === doctorId
      );
    });
  };

  const handleBulkDelete = async () => {
    if (selectedDoctors.length === 0) {
      alert("Please select at least one doctor to delete.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedDoctors.length} selected doctor(s)?`,
      )
    ) {
      try {
        await deleteDoctorByAdmin(selectedDoctors);
        setSelectedDoctors([]);
        await getAllDoctors();
      } catch (error) {
        console.error("Error deleting doctors:", error);
        alert("An error occurred while deleting doctors.");
      }
    }
  };

  //   Handle checkbox selection
  const handleSelectOne = (doctorId) => {
    setSelectedDoctors((prev) =>
      prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDoctors(filteredDoctors.map((doc) => doc._id));
    } else {
      setSelectedDoctors([]);
    }
  };

  const isAllSelected =
    filteredDoctors.length > 0 &&
    selectedDoctors.length === filteredDoctors.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Doctor Management
        </h1>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by name, email, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3a8dff]/20 focus:border-[#3a8dff] outline-none"
            />
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3a8dff]/20 focus:border-[#3a8dff] outline-none"
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty === "all" ? "All Specialties" : specialty}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredDoctors.length} of {doctors?.length || 0} doctors
          </p>
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
            disabled={selectedDoctors.length === 0}
          >
            Delete Selected
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-2xl shadow overflow-x-auto">
          {filteredDoctors.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-800 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3">AID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3">Qualification</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Verification Status</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3">Cases Reviewed</th>
                  <th className="px-4 py-3">Medical License</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor, index) => (
                  <tr
                    key={doctor._id}
                    className={`border-b hover:bg-gray-50 transition-all ${
                      selectedDoctors.includes(doctor._id) ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDoctors.includes(doctor._id)}
                        onChange={() => handleSelectOne(doctor._id)}
                      />
                    </td>

                    <td className="px-4 py-3 text-gray-600 truncate max-w-[100px]">
                      {doctor._id || "N/A"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 min-w-[200px]">
                      {doctor.name}
                    </td>
                    <td className="px-4 py-3">{doctor.email}</td>
                    <td className="px-4 py-3">{doctor.speciality}</td>
                    <td className="px-4 py-3">{doctor.degree}</td>
                    <td className="px-4 py-3">{doctor.experience}</td>
                    <td className="px-4 py-3">
                      {doctor.verification_status ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doctor.available
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {doctor.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#3a8dff] ">
                      {getDoctorCases(doctor._id, doctor.email, doctor.name)
                        .length || 0}
                    </td>
                    <td className="px-4 py-3 min-w-[200px]">
                      {doctor.certificate ? (
                        <a
                          href={doctor.certificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View License
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Not uploaded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No doctors found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorList;
