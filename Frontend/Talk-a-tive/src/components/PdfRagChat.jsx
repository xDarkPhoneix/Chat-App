import SideDrawer from "../miscellaneous/SideDrawer";
"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";
import {ChatState } from '../Contexts/ChatContext';




function  PdfRagChat () {
      const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user, END_POINT } = ChatState();

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);


    // 📄 Upload PDF
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }

      const formData = new FormData();
      formData.append("pdf", selectedFile);

      try {
       
        await axios.post(`${END_POINT}/api/uploads`, formData, {
          headers: { "Content-Type": "multipart/form-data" , Authorization: `Bearer ${user.data.user}`},
        },
        );
        setFile(selectedFile);
      } catch (err) {
        console.error(err);
      }
    }
  };

 // 💬 Send message
  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const userMessage = { role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);

    setQuery("");
    setLoading(true);

    try {
      const res = await axios.post(`${END_POINT}/api/chat`, {
        query,
      },{ headers: { Authorization: `Bearer ${user.data.user}` } });

      let parsed;

      // 🔥 Safe JSON parsing
      if (typeof res.data.message === "string") {
        try {
          parsed = JSON.parse(res.data.message);
        } catch {
          parsed = {
            answer: res.data.message,
            sources: [],
          };
        }
      } else {
        parsed = res.data.message;
      }

      const aiMessage = {
        role: "ai",
        answer: parsed.answer || "No answer",
        sources: parsed.sources || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    return (
      <div className="w-full h-screen flex flex-col overflow-hidden bg-transparent">
        <SideDrawer />
           <div className="h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      
      {/* LEFT SIDE */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="bg-gray-800/70 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-2xl p-8 w-[80%] max-w-md">
          <h2 className="text-2xl font-semibold mb-6">Upload PDF</h2>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-gray-700/40 transition">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-gray-300">Drag & drop your PDF</p>
            <p className="text-sm text-gray-500 mt-1">or click to browse</p>
          </label>

          {file && (
            <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
              <p className="text-green-400 text-sm">✔ {file.name}</p>
              <p className="text-gray-400 text-xs">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE - CHAT */}
      <div className="w-1/2 flex flex-col border-l border-gray-800">

        {/* HEADER */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chat with PDF 🤖</h2>
          {loading && (
            <div className="text-sm text-blue-400 animate-pulse">
              Thinking...
            </div>
          )}
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-20">
              Ask anything about your PDF 📄
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                {msg.role === "user" ? (
                  typeof msg.text === "string"
                    ? msg.text
                    : JSON.stringify(msg.text)
                ) : (
                  <div>
                    {/* Answer */}
                    <p>{msg.answer}</p>

                    {/* Sources */}
                    {Array.isArray(msg.sources) && msg.sources.length > 0 && (
                      <div className="mt-3 text-xs text-gray-400">
                        <p className="font-semibold text-gray-300">Sources:</p>
                        <ul className="list-disc ml-4">
                          {msg.sources.map((src, idx) => (
                            <li key={idx}>
                              {typeof src === "string"
                                ? src
                                : JSON.stringify(src)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 🔥 LOADING ANIMATION */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 px-4 py-3 rounded-2xl flex gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-gray-800 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask something..."
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="px-5 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
      </div>
    )
}

export default PdfRagChat;