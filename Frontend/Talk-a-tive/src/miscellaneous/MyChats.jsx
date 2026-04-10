import React, { useEffect, useState } from 'react';
import { ChatState } from '../Contexts/ChatContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import ChatLoading from './ChatLoading';
import { getsender } from '../config/Chatlogic';
import GroupChatModal from './GroupChatModal';

function MyChats() {
    const { user, selectedChat, setSelectedChat, chats, setChats, fetchAgain, END_POINT } = ChatState();
    const [loggeduser, setLoggedUser] = useState();

    const fetchCHats = async () => {
      try {
          const config = {
              headers: { Authorization: `Bearer ${user.data.user}` }
          };
          const { data } = await axios.get(`${END_POINT}/chats/fetchchats`, config);
          setChats(data.data);
      } catch (error) {
          toast.error("Failed to Load the chats");
      }
    };

    useEffect(() => {
       setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
       fetchCHats();
    }, [fetchAgain]);

    return (
      <div className={`${selectedChat ? "hidden" : "flex"} md:flex flex-col items-center w-full md:w-[31%] p-4 bg-dark-800 rounded-2xl border border-white/5 shadow-xl glass-panel`}>
        <div className="flex justify-between items-center w-full text-2xl md:text-3xl font-sans text-white pb-4 font-semibold">
          My Chats
          <GroupChatModal>
            <button className="flex items-center text-sm md:text-base bg-dark-700/80 hover:bg-dark-600 text-white transition-all py-2.5 px-4 rounded-xl shadow-md border border-white/10 group">
              New Group <FiPlus className="ml-2 group-hover:rotate-90 transition-transform" />
            </button>
          </GroupChatModal>
        </div>
        <div className="flex flex-col bg-dark-900/60 w-full h-[85%] rounded-2xl overflow-hidden border border-white/5 relative">
          {chats ? (
            <div className="overflow-y-auto w-full h-full p-3 space-y-2 absolute inset-0">
              {chats?.map((chat) => (
                 <div
                   onClick={() => setSelectedChat(chat)}
                   key={chat._id}
                   className={`cursor-pointer px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                     selectedChat === chat ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "bg-dark-800/80 text-gray-200 hover:bg-dark-700 border border-white/5 hover:border-white/10"
                   }`}
                 >
                   {!chat.isGroupchat
                     ? getsender(user?.data?.loggedInUser, chat.users)
                     : chat.chatName}
                 </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full absolute inset-0 p-3">
              <ChatLoading />
            </div>
          )}
        </div>
      </div>
    );
}

export default MyChats;