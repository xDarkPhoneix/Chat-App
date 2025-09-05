import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App.jsx";
import Home from "./components/Home.jsx";
import Layout from "./Layout.jsx";
import Chats from "./components/Chats.jsx";
import ChatProvider from "./Contexts/ChatContext.jsx";
import Login from "./components/Login.jsx";



const router = createBrowserRouter(
  createRoutesFromElements(
    
    <Route path="/" element={<Layout/>}>
    <Route path="/" element={<Home/>}/>
    <Route path="/chats" element={<Chats/>}/>
   
    </Route>
   
     
   
  )
);

createRoot(document.getElementById("root")).render(
 

 
   <ChatProvider>
   <ChakraProvider>
   <RouterProvider router={router}/>
  </ChakraProvider>
  </ChatProvider>
  
 
  
);
