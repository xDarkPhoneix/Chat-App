import React from 'react';
import { ChatState } from '../Contexts/ChatContext';
import SingleChat from '../components/SingleChat';
import "../index.css"

function ChatBox() {
  const { selectedChat } = ChatState();
  return (
    <div
      className={`${selectedChat ? "flex" : "hidden"} md:flex flex-col items-center w-full md:w-[68%] rounded-2xl border border-white/5 bg-dark-800/50 backdrop-blur-md shadow-2xl p-4 transition-all duration-300`}
    >
      <SingleChat />
    </div>
  )
}

export default ChatBox;