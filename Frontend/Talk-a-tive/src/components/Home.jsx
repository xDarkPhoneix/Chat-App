import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import { FaComments } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    console.log("homePage User", userInfo);
    if (userInfo) navigate("/chats");
  }, [navigate]);

  return (
    <div className="min-h-screen p-4 flex flex-col justify-center items-center w-full">
      <div className="glass-panel w-full max-w-xl p-6 rounded-2xl mb-6 flex justify-center items-center gap-3 animate-slide-up shadow-primary-500/10">
        <FaComments className="text-4xl text-primary-500" />
        <h1 className="text-4xl font-bold font-sans text-center bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-500">
          Talk-A-Tive
        </h1>
      </div>

      <div className="glass-panel w-full max-w-xl p-6 rounded-2xl animate-fade-in shadow-2xl">
        <div className="flex bg-dark-900/70 rounded-xl p-1 mb-6 border border-white/5">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === "login"
                ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                : "text-gray-400 hover:text-white hover:bg-dark-700/50"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeTab === "signup"
                ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                : "text-gray-400 hover:text-white hover:bg-dark-700/50"
            }`}
          >
            Sign Up
          </button>
        </div>
        
        <div className="mt-4 transition-all duration-300">
          {activeTab === "login" ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
}

export default Home;
