// src/components/mart/deleteProductDialog.jsx
import { useState } from "react";
import axios from "axios";
import { Trash2, X } from "lucide-react";
import Toast from "../Toast";

export default function DeleteProductDialog({ open, onClose, storeId, product }) {
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  if (!open) return null;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.delete(
        `http://localhost:3000/deleteProduct/${storeId}/${product._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast("Product deleted");
        onClose();
        window.location.reload();
      } else {
        showToast("Delete failed", "error");
      }
    } catch (err) {
      showToast("Server error", "error");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white p-6 rounded-xl w-full max-w-sm relative text-center" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow">
            <X className="w-5 h-5" />
          </button>
          <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h2 className="text-lg font-bold mb-2">Delete Product</h2>
          <p className="text-gray-600 mb-4">Are you sure you want to delete <strong>{product?.title}</strong>?</p>
          <div className="flex justify-center gap-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
