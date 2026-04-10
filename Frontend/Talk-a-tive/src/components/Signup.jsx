import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Contexts/ChatContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Signup() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { END_POINT } = ChatState();
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);
  const navigate = useNavigate();

  const handleclick = () => setShow(!show);

  const submitHandler = async (e) => {
    e.preventDefault();
    setPicLoading(true);
    
    if (!name || !email || !password || !confirmpassword) {
      toast.error("Please enter all required fields");
      setPicLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast.error("Passwords Do Not Match");
      setPicLoading(false);
      return;
    }

    try {
      const config = {
        headers: { "Content-type": "multipart/form-data" },
      };
      
      const { data } = await axios.post(
        `${END_POINT}/users/register`,
        { name, email, password, pic },
        config
      );

      toast.success("Registration Successful. Please Login.");
      setPicLoading(false);
      // Wait a sec for the user to read before redirecting or swapping tabs
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "User already exists or error occurred");
      setPicLoading(false);
    }
  };

  useEffect(() => {}, [navigate]);

  return (
    <form onSubmit={submitHandler} className="flex flex-col space-y-4 animate-fade-in">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300 ml-1">Name <span className="text-red-500">*</span></label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Your Name"
          required
          className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300 ml-1">Email <span className="text-red-500">*</span></label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Your Email Address"
          required
          className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300 ml-1">Password <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            value={password}
            type={show ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            required
            className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
          />
          <button
            type="button"
            onClick={handleclick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            value={confirmpassword}
            type={show ? "text" : "password"}
            onChange={(e) => setConfirmpassword(e.target.value)}
            placeholder="Confirm password"
            required
            className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
          />
          <button
            type="button"
            onClick={handleclick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300 ml-1">Upload Picture (Optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPic(e.target.files[0])}
          className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-2 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-500"
        />
      </div>

      <button
        type="submit"
        disabled={picLoading}
        className="w-full mt-4 bg-gradient-to-r from-accent-500 to-primary-600 hover:from-accent-400 hover:to-primary-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-accent-500/30 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {picLoading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : "Sign Up"}
      </button>
    </form>
  );
}

export default Signup;
