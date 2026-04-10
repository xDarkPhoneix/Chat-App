import React, { useEffect, useState } from 'react';
import { ChatState } from '../Contexts/ChatContext';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';
import { getsender, getSenderFull } from '../config/Chatlogic';
import GroupProfileModal from '../miscellaneous/GroupProfileModal';
import UpdateGroupChatModal from '../miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import ScorllableChat from '../miscellaneous/ScorllableChat';
import io from "socket.io-client";

var socket, selectedChatCompare;

function SingleChat() {
  const { user, selectedChat, setSelectedChat, chats, setChats, fetchAgain, setFetchAgain, notifications, setNotifications, END_POINT } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.data.user}` },
      };
      setLoading(true);
      const { data } = await axios.get(`${END_POINT}/message/${selectedChat._id}`, config);
      
      setMessages(data.data);
      setLoading(false);
      
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast.error("Failed to Load the Messages");
    }
  };

  const sendMessage = async (event) => {
    socket.emit("stop_typing", selectedChat._id);
    if (event.key === "Enter" && newMessage) {
      try {
        const config = {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.data.user}` },
        };

        const messageContent = newMessage;
        setNewMessage("");
        const { data } = await axios.post(`${END_POINT}/message/sendmessage`, {
          chatId: selectedChat._id,
          content: messageContent
        }, config);

        setMessages([...messages, data.data]);
        socket.emit("new message", data.data);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        toast.error("Failed to send the Message");
      }
    }
  };

  useEffect(() => {
    socket = io(END_POINT);
    socket.emit("setup", user.data.loggedInUser);
    socket.on("connected", () => { setSocketConnected(true) });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop_typing", () => setIsTyping(false));

    return () => {
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;
    
    const messageHandler = (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        if (!notifications.includes(newMessageRecieved)) {
          setNotifications([newMessageRecieved, ...notifications]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    };

    socket.on("message recieved", messageHandler);
    
    return () => {
      socket.off("message recieved", messageHandler);
    };
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
   
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
      let lastTypingTime = new Date().getTime();
      var timerLength = 3000;
      setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;
        if (timeDiff >= timerLength && typing) {
          socket.emit("stop_typing", selectedChat._id);
          setTyping(false);
        }
      }, timerLength);
    }
  };

  return (
    <>
      {selectedChat ? (
        <div className="flex flex-col w-full h-full relative">
          <div className="flex items-center justify-between pb-3 px-2 w-full font-sans">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2 bg-dark-700/50 hover:bg-dark-700 rounded-full text-white transition-colors border border-white/5"
                onClick={() => setSelectedChat("")}
              >
                <FiArrowLeft size={20} />
              </button>
              
              <h2 className="text-xl md:text-2xl font-semibold text-white">
                {!selectedChat.isGroupchat ? (
                  <GroupProfileModal user={getSenderFull(user, selectedChat.users)}>
                    <span className="cursor-pointer hover:text-primary-400 transition-colors">
                      {getsender(user.data.loggedInUser, selectedChat.users)}
                    </span>
                  </GroupProfileModal>
                ) : (
                  <UpdateGroupChatModal fetchMessages={fetchMessages}>
                    <span className="cursor-pointer hover:text-primary-400 transition-colors uppercase">
                      {selectedChat.chatName}
                    </span>
                  </UpdateGroupChatModal>
                )}
              </h2>
            </div>
          </div>

          <div className="flex flex-col justify-end p-4 bg-dark-900/60 w-full flex-1 rounded-xl overflow-hidden shadow-inner border border-white/5 relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                 <svg className="animate-spin h-12 w-12 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              </div>
            ) : (
              <div className="flex flex-col overflow-y-auto custom-scrollbar flex-1 w-full h-full"> 
                <ScorllableChat messages={messages}/>
              </div>
            )}
            
            <div className="mt-3 relative z-10 w-full pt-2 shrink-0">
              {istyping && (
                <div className="absolute -top-7 text-xs text-primary-400 font-medium px-2 py-1 bg-dark-800 rounded-md border border-white/5 shadow-sm">
                  Typing...
                </div>
              )}
              <input
                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-lg text-sm transition-all"
                placeholder="Enter a message and press enter..."
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={sendMessage}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full w-full">
          <p className="text-2xl md:text-3xl font-sans text-gray-400 font-medium">
            Click on a user to start chatting
          </p>
        </div>
      )}
    </>
  );
}

export default SingleChat;