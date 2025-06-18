// src/components/mart/crudProductDialog.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { X, Trash2 } from "lucide-react";
import Toast from "../Toast";

export default function CrudProductDialog({ open, onClose, storeId, product }) {
  const [title, setTitle] = useState("");
  const [des, setDes] = useState("");
  const [price, setPrice] = useState("");
  const [left, setLeft] = useState("");
  const [images, setImages] = useState([""]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setDes(product.des || "");
      setPrice(product.price || "");
      setLeft(product.left || "");
      setImages(product.images || [""]);
    } else {
      setTitle(""); setDes(""); setPrice(""); setLeft(""); setImages([""]);
    }
  }, [product]);

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
      const payload = {
        title,
        des,
        price: parseFloat(price),
        left: parseInt(left) || 0,
        images
      };

      const endpoint = product
        ? `http://localhost:3000/product/editProduct/${storeId}/${product._id}`
        : `http://localhost:3000/product/createProduct/${storeId}`;

      const method = product ? axios.put : axios.post;

      const res = await method(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        showToast(product ? "Product updated" : "Product created");
        onClose();
        window.location.reload();
      } else {
        showToast("Operation failed", "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Server error", "error");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.delete(
        `http://localhost:3000/product/deleteProduct/${storeId}/${product._id}`,
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

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white p-6 rounded-xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-4">{product ? "Edit Product" : "Create Product"}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="text" placeholder="Title" className="border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Description" className="border p-2 rounded" value={des} onChange={(e) => setDes(e.target.value)} />
            <input type="number" placeholder="Price" className="border p-2 rounded" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input type="number" placeholder="Stock Left" className="border p-2 rounded" value={left} onChange={(e) => setLeft(e.target.value)} />
            <input type="text" placeholder="Image URL" className="border p-2 rounded" value={images[0]} onChange={(e) => setImages([e.target.value])} />

            <div className="flex justify-between mt-4">
              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                {product ? "Update" : "Create"}
              </button>
              {product && (
                <button type="button" onClick={handleDelete} className="text-red-600 flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
