import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import ChatProvider from "./Contexts/ChatContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ChatProvider>
      <App />
      <Toaster position="bottom-center" />
    </ChatProvider>
  </BrowserRouter>
);
