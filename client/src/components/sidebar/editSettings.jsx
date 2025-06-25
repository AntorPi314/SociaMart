import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "../Toast";
import { X } from "lucide-react";

export default function EditSettings({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    profilePIC: "",
    phone: "",
    address: "",
    URL: "",
  });
  const [toast, setToast] = useState(null);
  const [isShop, setIsShop] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("https://sociamart.onrender.com/profile/info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          setForm(res.data.user);
        }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.isShop) setIsShop(true);
        }
      } catch (err) {
        setToast({ message: "Failed to load profile", type: "error" });
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put("https://sociamart.onrender.com/profile/update", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setToast({ message: "Profile updated successfully", type: "success" });
      } else {
        setToast({ message: "Update failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Server error", type: "error" });
    }
  };

  const currentURL = window.location.origin;

  return (
    <div className="relative max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-4">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        title="Close"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">Edit Profile</h2>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-600">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Profile Picture URL</label>
          <input
            name="profilePIC"
            value={form.profilePIC}
            onChange={handleChange}
            placeholder="Profile Picture URL"
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        {isShop && (
          <p className="text-sm text-gray-700 mt-4">
            🏬 My Shop:{" "}
            <a
              href={`${currentURL}/${form.URL}`}
              className="text-green-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {`${currentURL}/${form.URL}`}
            </a>
          </p>
        )}
      </div>

      <div className="text-right mt-6">
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
