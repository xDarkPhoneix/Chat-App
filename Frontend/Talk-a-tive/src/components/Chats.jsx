import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ChatState } from "../Contexts/ChatContext";
import SideDrawer from "../miscellaneous/SideDrawer";
import { Box } from "@chakra-ui/react";
import MyChats from "../miscellaneous/MyChats";
import ChatBox from "../miscellaneous/ChatBox";

function Chats() {

  const {user,setUser}=ChatState();

  useEffect(()=>{
    const userInfo=JSON.parse( localStorage.getItem("userInfo"))
   
    setUser(userInfo)
   

    
  },[])
  
 

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer/>}
      <Box className="flex justify-between p-10 "  h="91.5vh">
        {user && <MyChats />}
        {user && <ChatBox />}
      </Box>

    
    </div>
  );
}

export default Chats;
