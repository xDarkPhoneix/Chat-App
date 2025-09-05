import React from "react";
import { Button } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Contexts/ChatContext";



function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {setUser,END_POINT}=ChatState()
  const [loading, setLoading] = useState(false);
  const toast=useToast()
  const navigate=useNavigate()

  const handleclick = () => {
    setShow(!show);
  };


  const submitHandler = async (e) => {   
    e.preventDefault();
    setLoading(true)
    console.log( email, password);
    try {
       const config = {
          headers: {
            "Content-type": "application/json",
          },
        };
        const { data } = await axios.post( 
          `${END_POINT}/users/login`,
          {
           email,
           password
           
          },
         config
         
        );
       
        
        
        console.log(data);
        toast({
          title: "Login Successful",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setUser(data)
       localStorage.setItem("userInfo", JSON.stringify(data));
        setLoading(false)
        navigate("/chats")
    } 
    catch (error) {
      toast({
        title: "Error Occured!",
        description: "error",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false)
    }
      
    }
      

  return (
    <VStack spacing="10px">
      <FormControl id="emaill" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="text"
          value={email}
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="passwordd" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            type={show ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleclick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button colorScheme="blue" width="100%" style={{ marginTop: 15 }}
      type="submit"
      onClick={submitHandler}
      >
        Login
      </Button>
      <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        isLoading={loading}
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
}

export default Login;
