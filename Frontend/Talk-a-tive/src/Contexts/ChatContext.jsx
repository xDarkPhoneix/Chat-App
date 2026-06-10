import   { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatContext=createContext()

const ChatProvider=({children})=>{ 
    const END_POINT="https://chat-app-j86o.onrender.com"       //"http://localhost:3000" --- IGNORE ---     
    const [user,setUser]=useState()
    const [selectedChat,setSelectedChat]=useState()
    const [chats,setChats]=useState([])
    const [notifications,setNotifications]=useState([])
    const [fetchAgain,setFetchAgain]=useState(false)
   
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(()=>{
       const userInfo=JSON.parse(localStorage.getItem("userInfo"))
       setUser(userInfo)
       
       if(!userInfo) {
           if (location.pathname !== "/" && location.pathname !== "/auth") {
               navigate("/auth");
           }
       }
    },[navigate, location.pathname])

return (
    <ChatContext.Provider value={{user,setUser,selectedChat,setSelectedChat,chats,setChats,fetchAgain,setFetchAgain,notifications,setNotifications,END_POINT}}>
      {children}
    </ChatContext.Provider>
)
}

export const ChatState=()=>{
    return useContext(ChatContext)
}

export default ChatProvider