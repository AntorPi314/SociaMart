// src/App.jsx
import React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Mart from "./components/MartHome.jsx";

export default function App() {
  const { storeName } = useParams();

  return (
    <div className="flex h-screen p-2 overflow-hidden">
      <Sidebar />
      <Mart className="block md:block" storeName={storeName} />
    </div>
  );
}
