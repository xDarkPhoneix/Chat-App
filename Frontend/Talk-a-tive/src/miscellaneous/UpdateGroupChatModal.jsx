import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import { ChatState } from '../Contexts/ChatContext';
import { ViewIcon } from '@chakra-ui/icons';
import UserBadgeItem from './UserBadgeItem';
import axios from 'axios';
import UserListItem from './UserListItems';
import ChatLoading from './ChatLoading';

function  UpdateGroupChatModal ({fetchMessages}) {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    const toast = useToast();
  
    const { selectedChat, setSelectedChat, user,fetchAgain,setFetchAgain,END_POINT } = ChatState();
    const handleRemove=async(user1)=>{
     
      
      if(selectedChat.groupAdmin._id!==user.data.loggedInUser._id && user1._id!==user.data.loggedInUser._id){
        toast({
          title: "Only admins can remove  someone!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
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
        
        const {data}=await axios.post(`${END_POINT}/chats/removeFromGroup`,{
          chatId:selectedChat._id,
          userId:user1._id
        },config)
        console.log("removeuser data",data);
         
       
        
        user1._id==user.data.loggedInUser._id ? setSelectedChat():setSelectedChat(data.data)
        setFetchAgain(!fetchAgain)
        fetchMessages()
        setLoading(false)
          


      } catch (error) {
        toast({
          title: "Error Occured!",
          description: error.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      }
      setGroupChatName("");
        
      


    }
    const handleRename=async()=>{
        if (!groupChatName) return;

        try {

            const config={
                headers:{
                    Authorization:`Bearer ${user.data.user}`
                }
            };

           const {data}= await axios.put(`${END_POINT}/chats/renamegroup`,{
             chatId:selectedChat._id,
             chatName:groupChatName
           },config)
           

           console.log(data);
           setSelectedChat(data.data);
           setFetchAgain(!fetchAgain);
           setRenameLoading(false);
           onClose();
           

            
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
              setRenameLoading(false);
        }
            setGroupChatName("");
            
        

    }

    const handleAddUser=async(user1)=>{
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
              title: "User Already in group!",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
            return;
          }

          if(selectedChat.groupAdmin._id!==user.data.loggedInUser._id){
            toast({
              title: "Only admins can add someone!",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
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

         const {data}= await axios.post(`${END_POINT}/chats/addToGroup`,{
            chatId:selectedChat._id,
            userId:user1._id
          },config)
      
          setSelectedChat(data.data)
          setFetchAgain(!fetchAgain)
          setLoading(false)

          } catch (error) {
            toast({
              title: "Error Occured!",
              description: error.response.data.message,
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
            setLoading(false);
          }
          setGroupChatName("");
            
          

    }

    const handleSearch=async(query)=>{
      setSearch(query);
  if (!query) {
    return;
  }
   

  try {
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${user.data.user}`,
      },
    };
   const {data}= await axios.get(`${END_POINT}/users/getallUser?search=${search}`,config,{withCredentials:true})
   
    
    console.log(data);
    setLoading(false);
    setSearchResult(data);
  } 
  catch (error) {
    toast({
      title: "Error Occured!",
      description: "Failed to Load the Search Results",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom-left",
    });
  }
};

    return (
        <>
         <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
  
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            < ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            className='flex justify-center'
            >
                {selectedChat.chatName}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody  className='flex flex-col items-center'>
            <Box w="100%" className='flex flex-wrap' pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl  id='lol' className='flex'>
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl id='lol1' className='flex'>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) =>handleSearch(e.target.value)}
              />
            </FormControl>
            
           <Box className='flex flex-col' w="100%">
           {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user.data.loggedInUser)}
                />
              ))
            )}
           </Box>
          
              
            </ModalBody>
  
            <ModalFooter>
            <Button onClick={() => handleRemove(user.data.loggedInUser)} colorScheme="red">
              Leave Group
            </Button>
             
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
}

export default UpdateGroupChatModal;