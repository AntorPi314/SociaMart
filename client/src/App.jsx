import React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Mart from "./components/Mart.jsx";
import Socia from "./components/Socia.jsx";

export default function App() {
  const { storeName } = useParams(); // ✅ get from route like /BestBuyStore

  return (
    <div className="flex h-screen p-3">
      <Sidebar />
      <Mart storeName={storeName} /> {/* ✅ pass to Mart */}
      <Socia />
    </div>
  );
}
