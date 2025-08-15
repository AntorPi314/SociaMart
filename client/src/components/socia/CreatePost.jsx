import { useState } from "react";
import axios from "axios";
import Toast from "../Toast";
import { X } from "lucide-react";

export default function CreatePost({ open, onClose, storeName }) {
  const [text, setText] = useState("");
  const [postImage, setPostImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Please login to post", "error");
      return;
    }

    if (!text.trim()) {
      showToast("Post text cannot be empty", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `https://sociamart.onrender.com/post/${storeName}`,
        { text, post_image_link: postImage.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        showToast("Post created successfully", "success");
        setText("");
        setPostImage("");
        onClose();
        window.location.reload(); 
      } else {
        showToast(res.data.message || "Failed to post", "error");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Server error";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-xl w-100 text-black relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 bg-white text-gray-700 hover:text-red-500 rounded-full p-2 shadow-md transition duration-200 z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold mb-4">Create Post</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              rows="4"
              placeholder="What's on your mind?"
              className="border p-2 rounded text-black placeholder-gray-500 resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <input
              type="url"
              placeholder="Optional Image URL"
              className="border p-2 rounded text-black placeholder-gray-500"
              value={postImage}
              onChange={(e) => setPostImage(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
