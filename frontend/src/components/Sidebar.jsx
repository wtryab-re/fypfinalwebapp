import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";

const Sidebar = () => {
  const { dToken, profileData, getProfileData } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  useEffect(() => {
    if (dToken && !profileData) getProfileData();
  }, [dToken, profileData]); // Added profileData to dependency array for clarity/completeness

  // ADMIN SIDEBAR
  if (aToken && !dToken)
    return (
      // FIX: Replaced w-md with standard Tailwind CSS w-64 for medium width
      <aside className="min-h-screen bg-white border-r w-64">
        <div className="px-6 pt-6 pb-4 border-b">
          <img
            className="h-16 mx-auto cursor-pointer"
            src={assets.admin_logo}
            alt="Admin Logo"
          />

          <p className="text-center font-bold text-xl text-[#3a8dff] mt-2">
            PulmoVision
          </p>
        </div>

        <ul className="mt-4 px-3">
          {/* DASHBOARD */}
          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
                isActive
                  ? "bg-[#F2F3FF] text-[#3a8dff] "
                  : "hover:bg-gray-50 text-[#515151]"
              }`
            }
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
              class="lucide lucide-layout-panel-left-icon lucide-layout-panel-left"
            >
              <rect width="7" height="18" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
            </svg>{" "}
            <p>Dashboard</p>
          </NavLink>

          {/* ADD DOCTOR */}
          <NavLink
            to="/add-doctor"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
                isActive
                  ? "bg-[#F2F3FF] text-[#3a8dff] "
                  : "hover:bg-gray-50 text-[#515151]"
              }`
            }
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
              class="lucide lucide-user-plus-icon lucide-user-plus"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
            <p>Add Doctor</p>
          </NavLink>

          {/* DOCTOR LIST */}
          <NavLink
            to="/doctor-list"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
                isActive
                  ? "bg-[#F2F3FF] text-[#3a8dff] "
                  : "hover:bg-gray-50 text-[#515151]"
              }`
            }
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
              class="lucide lucide-stethoscope-icon lucide-stethoscope"
            >
              <path d="M11 2v2" />
              <path d="M5 2v2" />
              <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
              <path d="M8 15a6 6 0 0 0 12 0v-3" />
              <circle cx="20" cy="10" r="2" />
            </svg>
            <p>Registered Doctors</p>
          </NavLink>

          {/*  NEW: PATIENTS */}
          <NavLink
            to="/all-patients"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
                isActive
                  ? "bg-[#F2F3FF] text-[#3a8dff] "
                  : "hover:bg-gray-50 text-[#515151]"
              }`
            }
          >
            <img className="w-5" src={assets.people_icon} />
            <p>Patients</p>
          </NavLink>

          {/* WORKER APPROVAL */}
          <NavLink
            to="/worker-approval"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
                isActive
                  ? "bg-[#F2F3FF] text-[#3a8dff] "
                  : "hover:bg-gray-50 text-[#515151]"
              }`
            }
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
              class="lucide lucide-badge-check-icon lucide-badge-check"
            >
              <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <p>Worker Approval</p>
          </NavLink>

          {/* ALL CASES (ADMIN) */}
          <NavLink
            to="/all-cases"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
                isActive
                  ? "bg-[#F2F3FF] text-[#3a8dff] "
                  : "hover:bg-gray-50 text-[#515151]"
              }`
            }
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
              class="lucide lucide-square-activity-icon lucide-square-activity"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M17 12h-2l-2 5-2-10-2 5H7" />
            </svg>
            <p>All Cases</p>
          </NavLink>
        </ul>
      </aside>
    );

  // DOCTOR SIDEBAR
  return (
    // FIX: Replaced w-md with standard Tailwind CSS w-64 for medium width
    <aside className="min-h-screen bg-white border-r w-64">
      <div className="px-6 pt-6 pb-4 border-b">
        <img
          className="h-16 mx-auto cursor-pointer"
          src={assets.admin_logo}
          alt="Admin Logo"
        />

        <p className="text-center font-bold text-xl text-[#3a8dff] mt-2">
          PulmoVision
        </p>
      </div>

      <ul className="mt-4 px-3">
        <NavLink
          to="/doctor-dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
              isActive
                ? "bg-[#F2F3FF] text-[#3a8dff] "
                : "hover:bg-gray-50 text-[#515151]"
            }`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-layout-panel-left"
          >
            <rect width="7" height="18" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
          </svg>
          <p>Dashboard</p>
        </NavLink>

        <NavLink
          to="/doctor-chat"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
              isActive
                ? "bg-[#F2F3FF] text-[#3a8dff] "
                : "hover:bg-gray-50 text-[#515151]"
            }`
          }
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
            class="lucide lucide-messages-square-icon lucide-messages-square"
          >
            <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" />
          </svg>
          <p>Messages</p>
        </NavLink>

        <NavLink
          to="/reviewed-cases"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
              isActive
                ? "bg-[#F2F3FF] text-[#3a8dff] "
                : "hover:bg-gray-50 text-[#515151]"
            }`
          }
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
            class="lucide lucide-book-check-icon lucide-book-check"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            <path d="m9 9.5 2 2 4-4" />
          </svg>
          <p>Reviewed Cases</p>
        </NavLink>

        <NavLink
          to="/doctor-profile"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 mb-2 ${
              isActive
                ? "bg-[#F2F3FF] text-[#3a8dff] "
                : "hover:bg-gray-50 text-[#515151]"
            }`
          }
        >
          {profileData.image ? (
            <img src={profileData.image} className="rounded-full h-8 w-8" />
          ) : (
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
          )}
          <p>Profile</p>
        </NavLink>
      </ul>
    </aside>
  );
};

export default Sidebar;
