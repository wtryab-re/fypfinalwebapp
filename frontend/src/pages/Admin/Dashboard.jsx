import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const Dashboard = () => {
  const {
    aToken,
    getDashData,
    dashData,
    getAllCases,
    cases,
    getAllPatients,
    patients,
  } = useContext(AdminContext);

  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    if (aToken) {
      getDashData();
      getAllCases();
      getAllPatients();
    }
  }, [aToken]);

  // Calculate statistics
  const totalCases = cases?.length || 0;
  const reviewedCases =
    cases?.filter((c) => c.status === "reviewed").length || 0;
  const pendingCases = cases?.filter((c) => c.status === "pending").length || 0;

  const CARD_CLASSES =
    "w-52 h-28 flex flex-col justify-between p-4 rounded-xl border-2 cursor-pointer hover:scale-105 transition-all";
  const TEXT_CLASSES = "font-medium font-bold uppercase";
  const NUMBER_CLASSES = "text-3xl font-bold";

  const DOCTOR_CARD_BG = "bg-white border-gray-100";
  const DOCTOR_CARD_TEXT = "text-gray-500";
  const DOCTOR_CARD_NUMBER = "text-gray-800";

  // Pie chart data
  const caseData = [
    { name: "Reviewed", value: reviewedCases },
    { name: "Pending", value: pendingCases },
  ];
  const COLORS = ["#22c55e", "#FFA500"];

  // Fake revenue data (for line chart)
  const revenueData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 14500 },
    { month: "Mar", revenue: 13800 },
    { month: "Apr", revenue: 16000 },
    { month: "May", revenue: 17500 },
    { month: "Jun", revenue: 18200 },
    { month: "Jul", revenue: 19000 },
    { month: "Aug", revenue: 20000 },
    { month: "Sep", revenue: 21200 },
    { month: "Oct", revenue: 23000 },
    { month: "Nov", revenue: 24000 },
    { month: "Dec", revenue: 25000 },
  ];

  return (
    dashData && (
      <div className="m-5 max-w-[100vw] min-h-screen">
        {/* STATS CARDS */}
        <div className="flex flex-wrap gap-4 ">
          <div className={`${CARD_CLASSES} ${DOCTOR_CARD_BG}`}>
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT}`}>
              Total Revenue
            </p>
            <p className={`${NUMBER_CLASSES} ${DOCTOR_CARD_NUMBER}`}>
              RS 25,000
            </p>
          </div>

          <div
            onClick={() => navigate("/doctor-list")}
            className={`${CARD_CLASSES} ${DOCTOR_CARD_BG}`}
          >
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT}`}>
              Total Doctors
            </p>
            <p className={`${NUMBER_CLASSES} ${DOCTOR_CARD_NUMBER}`}>
              {dashData.doctors}
            </p>
          </div>

          <div
            onClick={() => navigate("/all-patients")}
            className={`${CARD_CLASSES} ${DOCTOR_CARD_BG}`}
          >
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT}`}>
              Total Patients
            </p>
            <p className={`${NUMBER_CLASSES} ${DOCTOR_CARD_NUMBER}`}>
              {patients?.length || dashData.patients}
            </p>
          </div>

          <div
            onClick={() => navigate("/worker-approval")}
            className={`${CARD_CLASSES} ${DOCTOR_CARD_BG}`}
          >
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT}`}>
              Approved Workers
            </p>
            <p className={`${NUMBER_CLASSES} ${DOCTOR_CARD_NUMBER}`}>
              {dashData.approvedWorkers || 0}
            </p>
          </div>

          <div
            onClick={() => navigate("/worker-approval")}
            className={`${CARD_CLASSES} ${DOCTOR_CARD_BG}`}
          >
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT}`}>
              Pending Workers
            </p>
            <p className={`${NUMBER_CLASSES} ${DOCTOR_CARD_NUMBER}`}>
              {dashData.pendingWorkers || 0}
            </p>
          </div>

          <div
            onClick={() => navigate("/all-cases")}
            className={`${CARD_CLASSES} ${DOCTOR_CARD_BG}`}
          >
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT}`}>Total Cases</p>
            <p className={`${NUMBER_CLASSES} ${DOCTOR_CARD_NUMBER}`}>
              {totalCases}
            </p>
          </div>

          <div className={`${CARD_CLASSES} ${DOCTOR_CARD_BG}`}>
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT}`}>
              Reviewed Cases
            </p>
            <p className={`${NUMBER_CLASSES} ${DOCTOR_CARD_NUMBER}`}>
              {reviewedCases}
            </p>
          </div>

          <div
            className={`${CARD_CLASSES} ${DOCTOR_CARD_BG}`}
            onClick={() => navigate("/all-cases")}
          >
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT}`}>
              Pending Cases
            </p>
            <p className={`${NUMBER_CLASSES} ${DOCTOR_CARD_NUMBER}`}>
              {pendingCases}
            </p>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="md:flex  flex-wrap gap-6 mt-8 justify-center">
          {/* PIE CHART - 50% */}
          <div className="bg-white flex-1 min-w-[45%] rounded-2xl p-6 shadow">
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT} mb-4`}>
              CASE REVIEW RATIO
            </p>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {caseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* REVENUE LINE CHART - 50% */}
          <div className="bg-white flex-1 min-w-[45%] rounded-2xl p-6 shadow md:mt-0 mt-6">
            <p className={`${TEXT_CLASSES} ${DOCTOR_CARD_TEXT} mb-4`}>
              MONTHLY REVENUE GROWTH
            </p>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white mt-8 w-full mr-4 rounded-2xl shadow overflow-hidden ">
          <div className="flex items-center justify-between px-4 py-4 rounded-t border">
            <div className="flex items-center gap-2.5">
              <p className="font-semibold">Recent Cases</p>
            </div>
            <button
              onClick={() => navigate("/all-cases")}
              className="text-[#3a8dff] text-sm font-medium hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="pt-4 border border-t-0">
            {cases?.slice(0, 3).map((caseItem, index) => (
              <div
                key={index}
                className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedCase(caseItem)}
              >
                <img
                  className="rounded-lg w-12 h-12 object-cover"
                  src={caseItem.imageUrl}
                  alt=""
                />
                <div className="flex-1 text-sm">
                  <p className="text-gray-800 font-medium">
                    Case #{caseItem._id?.slice(-6)}
                  </p>
                  <p className="text-gray-600">
                    Patient ID: {caseItem.patientId}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full w-20 text-xs text-center font-semibold ${
                    caseItem.status === "reviewed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {caseItem.status === "reviewed" ? "Reviewed" : "Pending"}
                </span>
              </div>
            ))}
            {(!cases || cases.length === 0) && (
              <p className="text-gray-500 text-center py-6">No cases to show</p>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
