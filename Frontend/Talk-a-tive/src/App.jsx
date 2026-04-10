import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Chats from "./components/Chats";
import Layout from "./Layout";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/chats" element={<Chats />} />
      </Route>
    </Routes>
  );
}

export default App;
