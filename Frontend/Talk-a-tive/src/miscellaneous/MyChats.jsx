import React, { useEffect, useState } from 'react';
import { ChatState } from '../Contexts/ChatContext';
import axios from 'axios';
import { Box, Button, Stack, Text, useToast } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getsender } from '../config/Chatlogic';
import GroupChatModal from './GroupChatModal';


function  MyChats () {
    const {user,selectedChat,setSelectedChat,chats,setChats,fetchAgain,END_POINT}=ChatState()
    const [loggeduser,setLoggedUser]=useState()
    const [loading,setLoading]=useState(false)
    const toast=useToast()

   
    const fetchCHats=async()=>{
      
      try {
         
          const config={
              headers:{
                  Authorization:`Bearer ${user.data.user}`
             }
          }

         const {data}= await axios.get(`${END_POINT}/chats/fetchchats`,config)
        
         
         setChats(data.data)
        

       
        
           
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the chats",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
          
      }

     

  }

  

    useEffect(()=>{
       setLoggedUser( JSON.parse(localStorage.getItem("userInfo")))
       
       fetchCHats()
      
      
      
       
       
    },[fetchAgain])


 

    const prints=()=>{
      chats.data?.map((chat)=>console.log("each chat",chat)
      )
      

    }

    return (
     <>
     
    <Box
      
     // d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      className={`${selectedChat ? "hidden" : "flex"} md:flex  flex-col items-center w-full md:w-[31%] `}
      p={3}
      bg="white"

     // w={{ base: "100%", md: "31%" }}
     
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        //fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        className='flex justify-between items-center w-full text-[25px] md:text-[30px]'
        
       
      >
       
         My Chats
        
      
       
        <GroupChatModal>
        <Button
          p={2}
           className='flex text-[10px] md:text-[17px]  '
           // fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            
              
            
            New Group Chat
          </Button>
          </GroupChatModal>
        </Box>
        <Box
        className='flex flex-col'
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
        > 
        { chats? (
             < Stack overflowY="scroll">
                {chats?.map((chat)=>(
                  
                  
                   <Box
                   onClick={() => setSelectedChat(chat)}
                   cursor="pointer"
                   bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                   color={selectedChat === chat ? "white" : "black"}
                   px={3}
                   py={2}
                   borderRadius="lg"
                   key={chat._id}
                 >
                <Text>
                  {!chat.isGroupchat
                    ? getsender(user.data.loggedInUser, chat.users)
                    : chat.chatName}
                </Text>

                 </Box>
                ))}
        
              </Stack>
          )
               :(<ChatLoading/>)}

      </Box>
        </Box>
        </>
    )
}

export default MyChats;