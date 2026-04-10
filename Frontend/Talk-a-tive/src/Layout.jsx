import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";

function Layout() {
  return (
    <div className="min-h-screen w-full bg-dark-900 bg-[url('/star.jpg')] bg-cover bg-center bg-no-repeat bg-fixed text-gray-100">
        <Outlet/>
    </div>
  );
}

export default Layout;
