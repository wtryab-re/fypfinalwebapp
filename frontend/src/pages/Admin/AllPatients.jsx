import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

const AllPatients = () => {
  const { patients, aToken, getAllPatients } = useContext(AdminContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("all");

  useEffect(() => {
    if (aToken) getAllPatients();
  }, [aToken]);

  // Filter patients
  const filteredPatients =
    patients?.filter((patient) => {
      const matchesSearch =
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber?.includes(searchTerm) ||
        patient._id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender =
        filterGender === "all" ||
        patient.gender?.toLowerCase() === filterGender;
      return matchesSearch && matchesGender;
    }) || [];

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  return (
    <div className="m-5 max-h-[90vh] overflow-y-auto">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Registered Patients
      </h1>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded border mb-5">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search by name, email, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded outline-none focus:border-[#3a8dff] min-w-[250px]"
          />
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-4 py-2 border rounded outline-none focus:border-[#3a8dff]"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Showing {filteredPatients.length} of {patients?.length || 0} patients
        </p>
      </div>

      {/* Patients Table */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        {filteredPatients.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr className="h-12">
                <th className="px-4 py-3">PID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">CNIC</th>
                <th className="px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient._id}
                  className="border-b hover:bg-gray-50 transition-all h-12"
                >
                  <td className="px-4 py-3 max-w-[120px] text-ellipsis overflow-hidden whitespace-nowrap">
                    {patient._id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {patient.name || "-"}
                  </td>
                  <td className="px-4 py-3">{patient.email || "N/A"}</td>
                  <td className="px-4 py-3">{patient.phoneNumber || "N/A"}</td>
                  <td className="px-4 py-3">
                    {patient.gender ? (
                      <span
                        className={`inline-block w-16 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                          patient.gender.toLowerCase() === "male"
                            ? "bg-blue-100 text-blue-700"
                            : patient.gender.toLowerCase() === "female"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {patient.gender}
                      </span>
                    ) : (
                      <span className="inline-block w-16 h-6 flex items-center justify-center text-xs text-gray-500 rounded-full">
                        N/A
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {patient.age || calculateAge(patient.dob) || "N/A"}
                  </td>
                  <td className="px-4 py-3">{patient.cnic || "N/A"}</td>
                  <td className="px-4 py-3">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No patients found
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPatients;
