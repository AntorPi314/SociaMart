// src/App.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Mart from "./components/Mart.jsx";
import Socia from "./components/Socia.jsx";

export default function App() {
  const { storeName } = useParams();
  const [showSociaMobile, setShowSociaMobile] = useState(false);

  useEffect(() => {
    const handler = () => setShowSociaMobile((prev) => !prev);
    window.addEventListener("toggle-socia", handler);
    return () => window.removeEventListener("toggle-socia", handler);
  }, []);

  return (
    <div className="flex h-screen p-1.5 overflow-hidden ">
      <Sidebar />
      <Mart className={`${showSociaMobile ? "hidden" : "block"} md:block `} storeName={storeName} />

      <div className={`md:w-[27%] w-full ${showSociaMobile ? "block" : "hidden"} md:block`}>
        <Socia storeName={storeName} />
      </div>
    </div>
  );
}
