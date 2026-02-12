import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);
  const [availableCases, setAvailableCases] = useState([]); // NEW: Available cases
  const [myCases, setMyCases] = useState([]); // NEW: My assigned cases
  const [rejectedCases, setRejectedCases] = useState([]); // NEW: Rejected cases (stored in localStorage)

  // Load rejected cases from localStorage when profileData is available
  useEffect(() => {
    if (profileData?._id) {
      const rejectedIds = JSON.parse(localStorage.getItem(`rejectedCases_${profileData._id}`) || '[]');
      console.log("📦 Loaded rejected case IDs from localStorage:", rejectedIds);
    }
  }, [profileData]);

  // Getting Doctor appointment data from Database using API
  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/appointments",
        { headers: { dToken } }
      );

      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  //   FIXED: Getting Doctor profile data from Database using API
  const getProfileData = async () => {
    try {
      console.log("📡 Fetching profile data...");

      const { data } = await axios.get(backendUrl + "/api/doctor/profile", {
        headers: { dToken },
      });

      console.log("📦 Profile API response:", data);

      if (data.success) {
        console.log("  Profile loaded successfully:", data.doctor);
        setProfileData(data.doctor);
      } else {
        console.error("❌ Profile fetch failed:", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      toast.error(error.message);
    }
  };

  // MODIFIED: Function to fetch cases data (now returns available & my cases)
  const getCasesData = async () => {
    try {
      // IMPORTANT: Don't proceed if profileData is not loaded yet
      if (!profileData || !profileData._id) {
        console.log("⏳ Waiting for profileData before loading cases...");
        return;
      }

      const { data } = await axios.get(backendUrl + "/api/doctor/cases", {
        headers: { dToken },
      });

      if (data.success) {
        // Load rejected cases from localStorage
        const doctorId = profileData._id;
        const rejectedIds = JSON.parse(localStorage.getItem(`rejectedCases_${doctorId}`) || '[]');
        
        console.log("📦 Doctor ID:", doctorId);
        console.log("📦 Rejected case IDs:", rejectedIds);
        console.log("📦 Total available from API:", data.availableCases?.length || 0);
        
        // Filter out rejected cases from available cases
        const filteredAvailable = (data.availableCases || []).filter(
          c => !rejectedIds.includes(c._id)
        );
        
        // Get full rejected case objects
        const rejected = (data.availableCases || []).filter(
          c => rejectedIds.includes(c._id)
        );
        
        console.log("✅ Filtered available:", filteredAvailable.length);
        console.log("✅ Rejected cases:", rejected.length);
        
        setAvailableCases(filteredAvailable);
        setMyCases(data.myCases || []);
        setRejectedCases(rejected);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // NEW: Function to accept a case
  const acceptCase = async (caseId) => {
    try {
      const { data } = await axios.post(
        backendUrl + `/api/doctor/cases/${caseId}/accept`,
        {},
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message || "Case accepted successfully!");
        // Refresh cases data
        await getCasesData();
        return { success: true, case: data.case };
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return { success: false };
    }
  };

  // NEW: Function to reject a case
  const rejectCase = async (caseId) => {
    try {
      // IMPORTANT: Check if profileData is loaded
      if (!profileData || !profileData._id) {
        toast.error("Profile not loaded. Please try again.");
        return { success: false };
      }

      const doctorId = profileData._id;
      
      // Store rejection in localStorage (client-side only)
      const rejectedIds = JSON.parse(localStorage.getItem(`rejectedCases_${doctorId}`) || '[]');
      
      if (!rejectedIds.includes(caseId)) {
        rejectedIds.push(caseId);
        localStorage.setItem(`rejectedCases_${doctorId}`, JSON.stringify(rejectedIds));
        console.log("✅ Saved rejected case to localStorage:", caseId);
        console.log("📦 Current rejected IDs:", rejectedIds);
      }
      
      toast.info("Case rejected and moved to Rejected Cases");
      
      // Refresh cases data to update the lists
      await getCasesData();
      
      return { success: true };
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return { success: false };
    }
  };

  // Function to cancel doctor appointment using API
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  // Function to Mark appointment completed using API
  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  // Getting Doctor dashboard data using API
  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", {
        headers: { dToken },
      });

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const submitCaseReport = async (caseId, reportData) => {
    try {
      const { data } = await axios.post(
        backendUrl + `/api/doctor/cases/${caseId}/report`,
        reportData,
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        // Refresh cases data after successful submission
        getCasesData();
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return { success: false };
    }
  };

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    dashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData,
    availableCases, // NEW
    myCases, // NEW
    rejectedCases, // NEW
    getCasesData,
    submitCaseReport,
    acceptCase, // NEW
    rejectCase, // NEW
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;