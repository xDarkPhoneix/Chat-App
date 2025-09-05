import React, { useEffect } from "react";
import { Button } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { VStack ,useToast} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import{ useNavigate} from "react-router-dom"
import { ChatState } from "../Contexts/ChatContext";

function Signup() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const {END_POINT}=ChatState()
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);
  const toast=useToast()
  const navigate=useNavigate()
  const [user,setUser]=useState()

  const handleclick = () => {
    setShow(!show);
  };



  const submitHandler = async (e) => {   
    setPicLoading(true)
    e.preventDefault();
    if(!name || !email || !password){
      toast({
        title: "Enter all feilds",
        status: "error",
        duration: 50000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false)
      return
    }
    console.log(name, email, password,pic);

    try {
       const config = {
          headers: {
            "Content-type": "multipart/form-data; boundary=<calculated when request is sent>",
          },
        };
        const { data } = await axios.post(
         ` ${END_POINT}/users/register`,
          {
            name,
            email,
            password,
            pic
           
          },
          config
        );
      
        console.log(data);
        toast({
          title: "Registration Successful Now Login",
          status: "success",
          duration: 7000,
          isClosable: true,
          position: "bottom",
        });
        navigate("")
    } catch (error) {
      toast({
        title: "Error Occured! || Maybe User Already Exists",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setName("")
       setConfirmpassword("")
       setEmail("")
       setPassword("")
        
      setPicLoading(false);
    }
      
    }
    
    useEffect(()=>{},[navigate])

  
 
  return (
    <>
      <VStack spacing="5px">
        <FormControl id="first-name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Enter Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
        <FormControl id="email" isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input
            value={email}
            type="email"
            placeholder="Enter Your Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup size="md">
            <Input
            value={password}
              type={show ? "text" : "password"}
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleclick}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id="passworrd" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup size="md">
            <Input
              value={confirmpassword}
              type={show ? "text" : "password"}
              placeholder="Confirm password"
              onChange={(e) => setConfirmpassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleclick}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl id="pic">
          <FormLabel>Upload your Picture</FormLabel>
          <Input
            type="file"
            p={1.5}
            accept="image/*"
            onChange={(e) => setPic(e.target.files[0])}
          />
        </FormControl>
        <Button colorScheme="blue"
         width="100%" 
        style={{ marginTop: 15 }}
        type="submit"
        isLoading={picLoading}
        onClick={submitHandler}
        >
          Sign Up
        </Button>
      </VStack>
    </>
  );
}

export default Signup;
