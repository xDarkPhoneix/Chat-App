import React, { useEffect } from "react";
import { ChatState } from "../Contexts/ChatContext";
import SideDrawer from "../miscellaneous/SideDrawer";
import MyChats from "../miscellaneous/MyChats";
import ChatBox from "../miscellaneous/ChatBox";

function Chats() {
  const { user, setUser } = ChatState();

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
    </div>
  );
}

export default Chats;
