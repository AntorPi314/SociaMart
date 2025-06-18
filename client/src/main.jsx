import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import About from "./About.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/:storeName" element={<App />} /> {/* dynamic */}
        <Route path="/" element={<App />} />  {/* fallback */}
      </Routes>
    </BrowserRouter>
  // </StrictMode>
);
