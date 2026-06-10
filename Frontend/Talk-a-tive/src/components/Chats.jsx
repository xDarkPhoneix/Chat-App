import React, { useEffect } from "react";
import { ChatState } from "../Contexts/ChatContext";
import SideDrawer from "../miscellaneous/SideDrawer";
import MyChats from "../miscellaneous/MyChats";
import ChatBox from "../miscellaneous/ChatBox";
import { useNavigate } from "react-router-dom";
import { BsStars } from "react-icons/bs";

function Chats() {
  const { user, setUser } = ChatState();
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-transparent">
      {user && <SideDrawer />}
      
      {/* Main layout underneath navbar */}
      <div className="flex justify-between w-full flex-1 px-4 py-4 md:py-6 overflow-hidden gap-4">
        {user && <MyChats />}
        {user && <ChatBox />}
      </div>
      {/* Floating AI Button */}
      {user && (
        <button
          onClick={() => navigate("/ai-chat")}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:scale-110 text-white p-5 rounded-full shadow-2xl shadow-violet-500/40 transition-all duration-300 animate-bounce cursor-pointer"
        >
          <BsStars size={26} />
        </button>
      )}
    </div>
  );
}

export default Chats;
