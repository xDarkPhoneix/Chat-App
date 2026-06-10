import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaComments,
  FaUsers,
  FaShieldAlt,
  FaBolt,
  FaRobot,
  FaFilePdf,
} from "react-icons/fa";
import { BsStars } from "react-icons/bs";

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) navigate("/chats");
  }, [navigate]);

  return (
    <div className="min-h-screen p-4 flex flex-col justify-center items-center w-full relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none"></div>

      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="max-w-6xl w-full flex flex-col items-center justify-center gap-12 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="glass-panel p-4 rounded-2xl animate-slide-up">
              <FaComments className="text-6xl text-primary-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-blue-400 to-accent-500">
              Talk-A-Tive
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Experience seamless real-time messaging with integrated{" "}
            <span className="text-primary-400 font-semibold">
              AI Assistant
            </span>{" "}
            and{" "}
            <span className="text-accent-400 font-semibold">
              PDF RAG Chat
            </span>
            . Upload documents, ask questions, and chat intelligently.
          </p>

          {/* CTA Buttons */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-5 relative z-50">
            <Link
              to="/auth"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <FaComments />
              Start Chatting
            </Link>

            <Link
              to="/ai-chat"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <FaRobot />
              Chat With AI
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-12">
          {/* Real-Time */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:bg-dark-800/90 transition-all duration-300 group">
            <div className="p-3 bg-primary-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaBolt className="text-2xl text-primary-500" />
            </div>

            <h3 className="text-xl font-bold text-white">Real-Time</h3>

            <p className="text-gray-400 text-sm">
              Instant messaging with typing indicators and live updates.
            </p>
          </div>

          {/* Group Chat */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:bg-dark-800/90 transition-all duration-300 group">
            <div className="p-3 bg-accent-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaUsers className="text-2xl text-accent-500" />
            </div>

            <h3 className="text-xl font-bold text-white">Group Chats</h3>

            <p className="text-gray-400 text-sm">
              Create communities, manage members, and collaborate easily.
            </p>
          </div>

          {/* AI Assistant */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:bg-dark-800/90 transition-all duration-300 group">
            <div className="p-3 bg-violet-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaRobot className="text-2xl text-violet-400" />
            </div>

            <h3 className="text-xl font-bold text-white">AI Assistant</h3>

            <p className="text-gray-400 text-sm">
              Ask anything, generate responses, summarize content, and get smart help instantly.
            </p>
          </div>

          {/* PDF RAG */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:bg-dark-800/90 transition-all duration-300 group">
            <div className="p-3 bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FaFilePdf className="text-2xl text-red-400" />
            </div>

            <h3 className="text-xl font-bold text-white">PDF RAG Chat</h3>

            <p className="text-gray-400 text-sm">
              Upload PDFs and chat with documents using AI-powered retrieval.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Landing;