import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Contexts/ChatContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, END_POINT } = ChatState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleclick = () => setShow(!show);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: { "Content-type": "application/json" },
      };
      const { data } = await axios.post(
        `${END_POINT}/users/login`,
        { email, password },
        config
      );

      toast.success("Login Successful");
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error Occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex flex-col space-y-5 animate-fade-in">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300 ml-1">Email Address <span className="text-red-500">*</span></label>
        <input
          type="email"
          value={email}
          placeholder="Enter Your Email Address"
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-sans"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300 ml-1">Password <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            value={password}
            type={show ? "text" : "password"}
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-sans"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            onClick={handleclick}
          >
            {show ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-gradient-to-r from-primary-600 to-blue-500 hover:from-primary-500 hover:to-blue-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : "Login"}
      </button>

      <button
        type="button"
        disabled={loading}
        className="w-full mt-2 bg-dark-700/50 hover:bg-dark-700 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </button>
    </form>
  );
}

export default Login;
