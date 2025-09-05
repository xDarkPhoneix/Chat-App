import React,{useEffect, useState} from 'react';
import { Box,Button,Input,MenuDivider,MenuItem,MenuList,Spinner,Text, useToast } from '@chakra-ui/react';
import { Tooltip, Menu,MenuButton,Avatar ,useDisclosure} from '@chakra-ui/react';
import {BellIcon, ChevronDownIcon} from "@chakra-ui/icons"
import { ChatState } from '../Contexts/ChatContext';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {  Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,} from "@chakra-ui/react"
import ChatLoading from './ChatLoading';
import UserListItem from './UserListItems';
import { getsender } from '../config/Chatlogic';


function  SideDrawer () {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const {user,setUser,selectedChat,setSelectedChat,chats,setChats,notifications,setNotifications,END_POINT}=ChatState()
    const [render,setrender]=useState(false)
    const toast=useToast()
    const navigate=useNavigate()
    const { isOpen, onOpen, onClose } = useDisclosure();
   
    const handlesearch=async()=>{
        if (!search) {
            toast({
              title: "Please Enter something in search",
              status: "warning",
              duration: 5000,
              isClosable: true,
              position: "top-left",
            });
            return;
          }

          try {
            setLoading(true)

            const config={
                headers:{
                    Authorization:`Bearer ${user.data.user}`
                }
            };

           const {data}= await axios.get(`${END_POINT}/users/getallUser?search=${search}`,config,{withCredentials:true})
           console.log(data);
           setLoading(false)
           setSearchResult(data)
           
          
           

          } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
              });
            
          }
       

    }
    
    const acsessChat=async(lol)=>{
        try {
            setLoadingChat(true)
            const config={
                "Content-Type":"application/json",
                headers:{
                     Authorization:`Bearer ${user.data.user}`
                }
            }
          const {data}= await axios.post(`${END_POINT}/chats/acessChat`,{
            userId:lol
          },config)
            
             console.log("acessChat",data);
            
             
             
              
             if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
             chats.find((c) => console.log(c._id === data._id)
             )
             
            setSelectedChat(data)
            setLoadingChat(false)
            setrender(!render)
             onClose();
            
        } catch (error) {
            toast({
                title: "Error Occured While fetching chat !",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
              });
            
        }

    }

    useEffect(()=>{},[render])
   

   

   

    const logouthanler=async()=>{
      const config={
        "Content-Type":"application/json",
        headers:{
             Authorization:`Bearer ${user.data.user}`
        }
    }
        
        localStorage.removeItem("userInfo")
        navigate("/")
    }

   
    return (
      <>
      <Box
      className='flex justify-between'
       
       alignItems="center"
       bg="white"
       w="100%"
       p="5px 10px 5px 10px"
       borderWidth="5px"
      >
      <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
          <i className="fas fa-search"></i>
            <Text 
            className='hidden md:flex'
             //d={{ base: "none", md: "flex" }}
            
             px={4}
            >
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text  className='text-xl md:text-2xl'>
          Talk-A-Tive
        </Text>

        <div>
        <Menu>
           <MenuButton p={1}>  
              
           <div className="relative inline-block mr-4">
           <BellIcon fontSize="2xl" m={1} />
           {notifications.length > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
           {notifications.length}
           </span>
            )}
              </div>
             
              
            </MenuButton>
            <MenuList pl={2}>
              {!notifications.length && "No New Messages"}
              {notifications.map((notif)=>(
                <MenuItem key={notif._id}
                onClick={()=>{
                  setSelectedChat(notif.chat)
                  setNotifications(notifications.filter((n)=>(n!==notif)));
                }}
                >
                  {
                   notif.chat.isGroupchat ? `New Message In  ${notif.chat.ChatName}` 
                   : `New Message from  ${getsender(user.data.loggedInUser,notif.chat.users)}`
                  }
                
                </MenuItem>
              ))}
              
            </MenuList>
            </Menu>
            <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.data.loggedInUser.name}
                src={user.data.loggedInUser.pic}
              />
              
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
              <MenuItem>My Profile</MenuItem>{" "}
              </ProfileModal>
              <MenuDivider />
              <MenuItem  onClick={logouthanler}>Logout</MenuItem>
            </MenuList>         
            </Menu>
            </div>
            
      </Box>
  
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
      <DrawerContent>
      <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
      <DrawerBody>
            <Box  className='flex' pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handlesearch} >Go</Button>
             </Box>
             {loading? <ChatLoading/>: (
                searchResult?.map((lol)=>(
                    <UserListItem
                      key={lol._id}
                      user={lol}
                      handleFunction={()=>acsessChat(lol._id)}
                    />
                ))
               
             )}
             {loadingChat && <Spinner ml="auto" className='flex justify-center'/>}

            </DrawerBody>
      </DrawerContent>
    
    </Drawer>

      
      </>
    )
}

export default SideDrawer;