import React from "react";
import Sidebar from "./components/Sidebar.jsx";
import Mart from "./components/Mart.jsx";
import Socia from "./components/Socia.jsx";

export default function App() {
  return (
    <div className="flex  h-screen p-3 ">
      <Sidebar />
      <Mart />
      <Socia />
      
    </div>
  );
}
