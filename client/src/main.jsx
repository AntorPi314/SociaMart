import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import AppHome from "./AppHome.jsx";
import About from "./About.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="/:storeName" element={<App />} /> {/* ei line e storeName asbe */}
      <Route path="/" element={<AppHome />} />
    </Routes>
  </BrowserRouter>
);
