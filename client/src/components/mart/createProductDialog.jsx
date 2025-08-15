// src/components/mart/createProductDialog.jsx
import { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import Toast from "../Toast";

export default function CreateProductDialog({ open, onClose, storeId }) {
  const [title, setTitle] = useState("");
  const [des, setDes] = useState("");
  const [price, setPrice] = useState("");
  const [left, setLeft] = useState("");
  const [images, setImages] = useState([""]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  if (!open) return null;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!title || !des || !price) {
      showToast("Please fill all required fields", "error");
      return;
    }
    try {
      const res = await axios.post(
        `https://sociamart.onrender.com/createProduct/${storeId}`,
        { title, des, price: parseFloat(price), left: parseInt(left) || 0, images },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast("Product created");
        onClose();
        window.location.reload();
      } else showToast("Create failed", "error");
    } catch (err) {
      showToast("Server error", "error");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white p-6 rounded-xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-4">Create Product</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 rounded" />
            <textarea placeholder="Description" value={des} onChange={(e) => setDes(e.target.value)} className="border p-2 rounded" />
            <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded" />
            <input type="number" placeholder="Stock Left" value={left} onChange={(e) => setLeft(e.target.value)} className="border p-2 rounded" />
            <input type="text" placeholder="Image URL" value={images[0]} onChange={(e) => setImages([e.target.value])} className="border p-2 rounded" />
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Create</button>
          </form>
        </div>
      </div>
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
