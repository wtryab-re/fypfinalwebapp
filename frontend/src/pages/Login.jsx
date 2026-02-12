import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";
import { toast } from "react-toastify";
import { Eye, EyeOff, User, Lock, Stethoscope, Shield } from "lucide-react";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { setDToken } = useContext(DoctorContext);
  const { setAToken } = useContext(AdminContext);

  const handleStateChange = (newState) => {
    if (newState !== state) {
      setIsTransitioning(true);
      setTimeout(() => {
        setState(newState);
        setIsTransitioning(false);
        setEmail("");
        setPassword("");
      }, 300);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (state === "Admin") {
        const { data } = await axios.post(backendUrl + "/api/admin/login", {
          email,
          password,
        });
        if (data.success) {
          setAToken(data.token);
          localStorage.setItem("aToken", data.token);
          toast.success("Admin login successful!");
          navigate("/admin-dashboard");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/doctor/login", {
          email,
          password,
        });
        if (data.success) {
          setDToken(data.token);
          localStorage.setItem("dToken", data.token);
          toast.success("Doctor login successful!");
          navigate("/doctor-dashboard");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Toggle */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex bg-white/20 rounded-full p-1">
                <button
                  onClick={() => handleStateChange("Admin")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    state === "Admin"
                      ? "bg-white text-blue-700 shadow-lg"
                      : "text-white hover:text-blue-200"
                  }`}
                >
                  <Shield size={18} />
                  Admin
                </button>
                <button
                  onClick={() => handleStateChange("Doctor")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    state === "Doctor"
                      ? "bg-white text-blue-700 shadow-lg"
                      : "text-white hover:text-blue-200"
                  }`}
                >
                  <Stethoscope size={18} />
                  Doctor
                </button>
              </div>
            </div>

            <div className="text-center">
              <div
                className={`transition-all duration-500 transform ${
                  isTransitioning
                    ? "opacity-0 scale-95"
                    : "opacity-100 scale-100"
                }`}
              >
                <h1 className="text-2xl font-bold text-white">{state} Login</h1>
                <p className="text-blue-100 mt-2">
                  {state === "Admin"
                    ? "Access the administration panel"
                    : "Sign in to your medical dashboard"}
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmitHandler} className="p-8">
            <div
              className={`space-y-6 transition-all duration-500 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="border border-gray-300 rounded-lg w-full pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="border border-gray-300 rounded-lg w-full pl-10 pr-12 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
