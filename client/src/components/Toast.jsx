// components/Toast.js
import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // auto-close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50`}>
      <div
        className={`px-4 py-2 rounded shadow-md text-white transition-all
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
      >
        {message}
      </div>
    </div>
  );
}
