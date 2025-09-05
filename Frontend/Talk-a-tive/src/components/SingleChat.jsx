import React, { useEffect, useState } from 'react';
import { ChatState } from '../Contexts/ChatContext';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getsender, getSenderFull } from '../config/Chatlogic';
import ProfileModal from '../miscellaneous/ProfileModal';
import GroupProfileModal from '../miscellaneous/GroupProfileModal';
import UpdateGroupChatModal from '../miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import ScorllableChat from '../miscellaneous/ScorllableChat';
import io from "socket.io-client"





var socket,selectedChatCompare;

function  SingleChat () {
    const {user,setUser,selectedChat,setSelectedChat,chats,setChats,fetchAgain,setFetchAgain,notifications,setNotifications,END_POINT}=ChatState()
    const [loggeduser,setLoggedUser]=useState()
    const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected,setSocketConnected]=useState(false)
  const [typing,setTyping]=useState(false)
  const [istyping,setIsTyping]=useState(false)
  const toast=useToast()
    
 

  const fetchMessages=async()=>{
    if (!selectedChat) return;

    try {
      
      const config = {
      
        headers: {
          Authorization: `Bearer ${user.data.user}`,
        },
      };
      setLoading(true)
       const {data}=await axios.get(`${END_POINT}/message/${selectedChat._id}`,config)
      

       setMessages(data.data)
       setLoading(false)
       console.log("messg",messages);
       
       socket.emit("join chat",selectedChat._id)
       

       
      
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }



  }
  const sendMessage=async(event)=>{
    socket.emit("stop_typing",selectedChat._id)
    if(event.key==="Enter" && newMessage){
       
      try {
        
        const config = {
          "Content-Type":"application/json",
          headers: {
            Authorization: `Bearer ${user.data.user}`,
          },
        };

        setNewMessage("")
       const {data}= await axios.post(`${END_POINT}/message/sendmessage`,{
         chatId:selectedChat._id,
         content:newMessage

        },config)
        
       

        setMessages([...messages,data.data])
        socket.emit("new message",data.data)
        setFetchAgain(!fetchAgain)
        
        
        

      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        
      }

    }

  }

  

  useEffect(()=>{
    socket=io(END_POINT)
    socket.emit("setup",user.data.loggedInUser)
    socket.on("connected",()=>{setSocketConnected(true)})
    socket.on("typing",()=>setIsTyping(true))
    socket.on("stop_typing",()=>setIsTyping(false))


    return ()=>{
      socket.disconnect();
    }
  
  },[])

  useEffect(()=>{
    
    fetchMessages()
  

    
    selectedChatCompare=selectedChat;

},[selectedChat])

useEffect(()=>{
   
 
  socket.on("message recieved",(newMessageRecieved)=>{
    if(!selectedChatCompare || selectedChatCompare._id!==newMessageRecieved.chat._id){
      if(!notifications.includes(newMessageRecieved)){
        console.log("new",newMessageRecieved);
        
        setNotifications([newMessageRecieved, ...notifications])
        setFetchAgain(!fetchAgain)

      }

    }
    else {
      setMessages([...messages,newMessageRecieved])
    }
  })


  
  
})

const typingHandler=(e)=>{
  setNewMessage(e.target.value)

  if(!socketConnected) return;
 
  if(!typing ){
    setTyping(true)
    socket.emit("typing",selectedChat._id)
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


}


   
    return (
     <>
     {selectedChat? (
        <>
         <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
           className='flex items-center justify-between'
          > <IconButton
          d={{ base: "flex", md: "none" }}
          icon={<ArrowBackIcon />}
          onClick={() => setSelectedChat("")}
        />
            {(!selectedChat.isGroupchat ? (
                <>
                   {getsender(user.data.loggedInUser, selectedChat.users)}
                  <GroupProfileModal
                   user={getSenderFull(user, selectedChat.users)}
                  />
                  
                 
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                   fetchMessages={fetchMessages}
                  />
                </>
              ))}
          </Text>

          <Box
            className='flex flex-col justify-end'
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
          {loading? (
            <Spinner
            
            size="xl"
            w={20}
            h={20}
            alignSelf="center"
            margin="auto"
            />
          ) : (
            <div className='flex flex-col overflow-y-scroll scroll'> 
             <ScorllableChat messages={messages}/>
            </div>
          )}
          <FormControl onKeyDown={sendMessage} isRequired mt={3}>
            {istyping ? (<div>Typing...</div>):(<></>)}
            <Input
             variant="filled"
             bg="#E0E0E0"
             placeholder="Enter a message.."
             value={newMessage}
             onChange={typingHandler}
            
            />

          </FormControl>
          </Box>
        </>
    
    
    ) : (
        <Box className='flex justify-center items-center' h="100%">
        <Text fontSize="3xl" pb={3} fontFamily="Work sans">
          Click on a user to start chatting
        </Text>
      </Box>
    )
     
    }
     
     
     </>
    )
}

export default SingleChat;