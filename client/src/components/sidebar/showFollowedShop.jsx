// src/components/sidebar/showFollowedShop.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import Toast from "../Toast";

export default function ShowFollowedShop({ open, onClose }) {
  const [stores, setStores] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!open) return;

    const fetchFollowedStores = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("https://sociamart.onrender.com/stores/followed/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setStores(res.data.stores || []);
        } else {
          setToast({ message: "Failed to load followed stores", type: "error" });
        }
      } catch (err) {
        setToast({ message: "Error loading stores", type: "error" });
      }
    };

    fetchFollowedStores();
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div
          className="bg-white max-w-lg w-full p-6 rounded-xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-white shadow hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold mb-4 text-center">Followed Stores</h2>
          {stores.length === 0 ? (
            <p className="text-gray-500 text-center">No followed stores found.</p>
          ) : (
            <div className="space-y-4">
              {stores.map((store) => (
                <a
                  key={store._id}
                  href={`/${store.URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  <img
                    src={store.profilePIC || "/assets/bx_store.svg"}
                    alt={store.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-800">{store.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
