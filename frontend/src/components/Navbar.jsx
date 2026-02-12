import React, { useContext } from "react";
// import { assets } from "../assets/assets";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setIsSideBarOpen, isSideBarOpen }) => {
  const { dToken, setDToken } = useContext(DoctorContext);
  const { aToken, setAToken } = useContext(AdminContext);
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
    dToken && (setDToken(""), localStorage.removeItem("dToken"));
    aToken && (setAToken(""), localStorage.removeItem("aToken"));
  };

  const toggleSidebar = () => {
    setIsSideBarOpen(!isSideBarOpen);
  };
  //ADMIN NAVBAR

  if (aToken && !dToken) {
    return (
      <div className="w-full bg-white border-b sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-2 flex items-center justify-between">
          {/*SIDEBAR TOGGLE BUTTON (FAR LEFT) */} 
          <button
            onClick={toggleSidebar}
            className="p-2 text-black hover:bg-gray-100 rounded-full transition duration-150"
            aria-label={isSideBarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1d1b1b"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-panel-left-dashed-icon lucide-panel-left-dashed"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 14v1" />
              <path d="M9 19v2" />
              <path d="M9 3v2" />
              <path d="M9 9v1" /> 
            </svg>
          </button>
          {/*ADMIN PANEL TEXT (MIDDLE) */} 
          <h1 className="text-xl  text-center font-semibold text-gray-800 hidden sm:block">
            Admin Panel
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
                Admin
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-[#3a8dff] text-white text-sm px-10 py-2 rounded-full"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  } //DOCTOR NAVBAR - ALREADY INCLUDES TOGGLE BUTTON

  return (
    <>
      <div className="w-full bg-white border-b sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-2 flex items-center justify-between">
          {/*SIDEBAR TOGGLE BUTTON (FAR LEFT) */} 
          <button
            onClick={toggleSidebar}
            className="p-2 text-black hover:bg-gray-100 rounded-full transition duration-150"
            aria-label={isSideBarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1d1b1b"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-panel-left-dashed-icon lucide-panel-left-dashed"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 14v1" />
              <path d="M9 19v2" />
              <path d="M9 3v2" />
              <path d="M9 9v1" /> 
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
            Doctor's Panel
          </h1>
          {/* Logout Button (FAR RIGHT) */} 
          <button
            onClick={logout}
            className="px-6 py-2 rounded-full bg-[#3a8dff] text-white text-sm hover:bg-[#3a8dff]/80 w-24"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
