import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import Login from "./Login";
import Signup from "./Signup";

function Home() {
  const navigate=useNavigate()

  useEffect(()=>{
    const userInfo=JSON.parse( localStorage.getItem("userInfo"))
    console.log("homePage User",userInfo);
   
    if (userInfo) navigate("/chats");
   

  },[navigate])

    


       

  return (
    <Container maxW="xl" centerContent>
      <Box
       
       className="flex justify-center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans" className="text-center">
          Talk-A-Tive
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Home;
