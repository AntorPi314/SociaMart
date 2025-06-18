// src/components/mart/editProductDialog.jsx
import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import axios from "axios";
import Toast from "../Toast";
import DeleteProductDialog from "./deleteProductDialog"; // ⬅️ Import added

export default function EditProductDialog({ open, onClose, storeId, product }) {
  const [title, setTitle] = useState("");
  const [des, setDes] = useState("");
  const [price, setPrice] = useState("");
  const [left, setLeft] = useState("");
  const [images, setImages] = useState([""]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showDelete, setShowDelete] = useState(false); // ⬅️ State for delete dialog

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setDes(product.des || "");
      setPrice(product.price || "");
      setLeft(product.left || "");
      setImages(product.images || [""]);
    }
  }, [product]);

  if (!open) return null;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `http://localhost:3000/editProduct/${storeId}/${product._id}`,
        { title, des, price: parseFloat(price), left: parseInt(left) || 0, images },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast("Product updated");
        onClose();
        window.location.reload();
      } else showToast("Update failed", "error");
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
          <h2 className="text-xl font-bold mb-4">Edit Product</h2>
          <form onSubmit={handleUpdate} className="flex flex-col gap-3">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 rounded" />
            <textarea placeholder="Description" value={des} onChange={(e) => setDes(e.target.value)} className="border p-2 rounded" />
            <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded" />
            <input type="number" placeholder="Stock Left" value={left} onChange={(e) => setLeft(e.target.value)} className="border p-2 rounded" />
            <input type="text" placeholder="Image URL" value={images[0]} onChange={(e) => setImages([e.target.value])} className="border p-2 rounded" />
            <div className="flex justify-between mt-4">
              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Update</button>
              <button
                type="button"
                className="flex items-center gap-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} />}

      {/* ⬇️ Delete dialog when red button clicked */}
      {showDelete && (
        <DeleteProductDialog
          open={true}
          onClose={() => setShowDelete(false)}
          storeId={storeId}
          product={{
            _id: product._id,
            title: product.title,
          }}
        />
      )}
    </>
  );
}
