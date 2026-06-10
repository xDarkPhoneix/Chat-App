import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Auth from "./components/Auth";
import Chats from "./components/Chats";
import Layout from "./Layout";
import "./App.css";
import AIChat from "./components/AIChat";
import PdfRagChat from "./components/PdfRagChat";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/pdf-rag" element={<PdfRagChat />} />
      </Route>
    </Routes>
  );
}

export default App;
