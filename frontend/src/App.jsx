import React, { useContext, useState } from "react";
import { DoctorContext } from "./context/DoctorContext";
import { AdminContext } from "./context/AdminContext";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import Login from "./pages/Login";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import WorkerApproval from "./pages/Admin/WorkerApproval";
import DoctorChat from "./pages/Doctor/DoctorChat";
import AllCases from "./pages/Doctor/AllCases";
import AllPatients from "./pages/Admin/AllPatients";
import AdminCases from "./pages/Admin/Cases";
import ReviewedCases from "./pages/Doctor/ReviewedCases";
import Homepage from "./Homepage"; // Import the Homepage component

const App = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  
  return dToken || aToken ? (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar
        setIsSideBarOpen={setIsSideBarOpen}
        isSideBarOpen={isSideBarOpen}
      />
      <div className="flex items-start">
        {isSideBarOpen && <Sidebar />}

        <div className="flex-1 p-6 overflow-y-auto h-screen">
          <Routes>
            <Route path="/" element={<></>} />

            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/all-appointments" element={<AllAppointments />} />
            <Route path="/add-doctor" element={<AddDoctor />} />
            <Route path="/doctor-list" element={<DoctorsList />} />
            <Route path="/worker-approval" element={<WorkerApproval />} />
            <Route path="/all-cases" element={<AdminCases />} />
            <Route path="/all-patients" element={<AllPatients />} />

            {/* Doctor Routes */}
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route
              path="/doctor-appointments"
              element={<DoctorAppointments />}
            />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/doctor-chat" element={<DoctorChat />} />
            <Route path="/doctor-all-cases" element={<AllCases />} />
            <Route path="/reviewed-cases" element={<ReviewedCases />} />
          </Routes>
        </div>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;