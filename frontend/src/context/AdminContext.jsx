import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dashData, setDashData] = useState(false);

  // NEW STATES
  const [cases, setCases] = useState([]);
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);

  // Getting all Doctors data from Database
  const getAllDoctors = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/all-doctors", {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete Doctor
  const deleteDoctorByAdmin = async (ids) => {
    try {
      console.log(`Deleting doctors: ${ids}`);
      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-doctor",
        { ids },
        { headers: { atoken: aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        await getAllDoctors(); // Refresh doctor list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Function to change doctor availablity using API
  const changeAvailability = async (docId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        { headers: { atoken: aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Getting all appointment data from Database
  const getAllAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  // Function to cancel appointment using API
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { atoken: aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  // Getting Admin Dashboard data from Database
  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { atoken: aToken },
      });

      if (data.success) {
        setDashData(data.dashData);
        console.log("  Dashboard Data:", data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  //   NEW: Get all cases
  const getAllCases = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/all-cases", {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setCases(data.cases);
        console.log("  Cases Data:", data.cases);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // NEW: Get all patients
  const getAllPatients = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/all-patients", {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setPatients(data.patients);
        console.log("  Patients Data:", data.patients);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // NEW: Get all users (patients + workers)
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/all-users", {
        headers: { atoken: aToken },
      });
      if (data.success) {
        setUsers(data.users);
        console.log("  Users Data:", data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    doctors,
    getAllDoctors,
    changeAvailability,
    deleteDoctorByAdmin,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,

    // NEW VALUES
    cases,
    getAllCases,
    patients,
    getAllPatients,
    users,
    getAllUsers,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
