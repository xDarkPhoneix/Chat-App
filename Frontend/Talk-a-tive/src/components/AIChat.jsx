import { useState, useRef, useEffect } from 'react';
import SideDrawer from "../miscellaneous/SideDrawer";
import { ChatState } from '../Contexts/ChatContext';
import toast from 'react-hot-toast';
import ReactMarkdown from "react-markdown";
function AIChat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, END_POINT } = ChatState();

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

const handleSend = async () => {
  if (!query.trim() || loading) return;

  const userQuery = query.trim();

  setLoading(true);
  setQuery("");

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      text: userQuery,
    },
    {
      role: "ai",
      text: "",
    },
  ]);

  try {
    const response = await fetch(
      `${END_POINT}/aichat/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.data.user}`,
        },
        body: JSON.stringify({
          query: userQuery,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to connect to AI");
    }

    if (!response.body) {
      throw new Error("No response stream available");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let aiText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, {
        stream: true,
      });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        const lines = event.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const payload = line.slice(6).trim();

          if (payload === "[DONE]") {
            reader.cancel();
            break;
          }

          try {
            const parsed = JSON.parse(payload);

            if (parsed.type === "error") {
              toast.error(parsed.message);

              setMessages((prev) =>
                prev.filter(
                  (_, index) =>
                    !(
                      index === prev.length - 1 &&
                      prev[index].role === "ai" &&
                      !prev[index].text
                    ),
                ),
              );

              setLoading(false);
              return;
            }

            if (parsed.type === "chunk") {
              aiText += parsed.text;

              setMessages((prev) => {
                const updated = [...prev];

                updated[updated.length - 1] = {
                  role: "ai",
                  text: aiText,
                };

                return updated;
              });
            }

            if (parsed.type === "done") {
              console.log(
                "Full Response:",
                parsed.fullResponse,
              );
            }
          } catch (err) {
            console.error(
              "Stream Parse Error:",
              err,
            );
          }
        }
      }
    }
  } catch (err) {
    console.error(err);

    toast.error(
      err.message || "Failed to get AI response",
    );

    setMessages((prev) =>
      prev.filter(
        (_, index) =>
          !(
            index === prev.length - 1 &&
            prev[index].role === "ai" &&
            !prev[index].text
          ),
      ),
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-transparent">
      <SideDrawer />
      <div className="flex-1 flex justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-4 pb-4">
        
        <div className="w-full max-w-4xl flex flex-col bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden mx-4">
          {/* HEADER */}
          <div className="p-5 border-b border-gray-700/50 flex items-center justify-between bg-gray-800/40">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
              AI Assistant 🤖
            </h2>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-70">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-gray-300 text-lg font-medium text-center">
                  How can I help you today?
                </p>
                <p className="text-gray-500 text-sm mt-2 text-center max-w-md">
                  Ask me anything! I am your personal AI assistant ready to help you with your queries.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-lg ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-sm"
                      : "bg-gray-800/80 border border-gray-700/50 text-gray-100 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    <ReactMarkdown>
                       {msg.text}
                     </ReactMarkdown></p>
                </div>
              </div>
            ))}

            {/* LOADING ANIMATION REMOVED */}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-4 border-t border-gray-700/50 bg-gray-800/40">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Message AI Assistant..."
                className="flex-1 p-3.5 rounded-xl bg-gray-900/80 border border-gray-600/50 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-inner text-[15px]"
              />
              <button
                onClick={handleSend}
                disabled={loading || !query.trim()}
                className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-violet-500/20 flex items-center justify-center min-w-[100px]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChat;