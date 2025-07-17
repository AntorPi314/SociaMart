import { Heart, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    part.match(urlRegex) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-words"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

export default function CustomPost({
  owner_id,
  name,
  image,
  likeCount: initialLikeCount,
  timeAgo,
  text,
  post_image_link,
  likedProp,
  shopId,
  postId,
  onDelete,
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = shopId === user._id || owner_id === user._id;

  useEffect(() => {
    setLiked(likedProp);
    setLikeCount(initialLikeCount);
  }, [likedProp, initialLikeCount]);

  const toggleLiked = async () => {
    if (!shopId || !postId || loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("User not logged in");
        return;
      }

      const url = liked
        ? "http://localhost:3000/like/remove"
        : "http://localhost:3000/like/add";

      await axios.post(
        url,
        { shopId, postId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setLiked((prev) => {
        const newLiked = !prev;
        setLikeCount((count) => count + (newLiked ? 1 : -1));
        return newLiked;
      });
    } catch (error) {
      console.error("Like toggle failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!shopId || !postId) return;
    setDeleting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("User not logged in");
        setDeleting(false);
        setShowConfirm(false);
        return;
      }

      await axios.delete(`http://localhost:3000/post/${shopId}/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowConfirm(false);
      onDelete && onDelete(postId);
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-stone-300 rounded-2xl p-4 mb-2 shadow-sm space-y-3 font-sans">
        <div className="flex items-start gap-3">
          <img
            src={image}
            alt={`${name} profile`}
            className="w-[48px] h-[48px] rounded-full shadow"
          />
          <div className="flex-1 flex flex-col">
            <p className="text-zinc-900 font-bold text-sm leading-5">{name}</p>
            <p className="text-stone-500 text-xs leading-4">
              {likeCount} Liked &nbsp;|&nbsp; {timeAgo}
            </p>
          </div>

          {isOwner && (
            <button
              onClick={() => setShowConfirm(true)}
              aria-label="Delete post"
              className="flex items-center focus:outline-none text-stone-400 hover:text-red-600 transition-colors"
              type="button"
              disabled={deleting}
            >
              <Trash2 className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={toggleLiked}
            disabled={loading}
            aria-label={liked ? "Unlike post" : "Like post"}
            className="flex items-center focus:outline-none mr-2"
            type="button"
          >
            <Heart
              className={`cursor-pointer w-7 h-7 transition-transform duration-300 ease-in-out drop-shadow-md
                hover:scale-125 ${
                  liked
                    ? "text-red-600 fill-red-600"
                    : "text-red-500 hover:text-red-600 fill-none"
                }`}
              fill={liked ? "currentColor" : "none"}
            />
          </button>
        </div>

        <p className="text-stone-800 text-sm leading-5 whitespace-pre-line break-words">
          {linkify(text)}
        </p>

        {post_image_link && (
          <img
            src={post_image_link}
            alt="Post image"
            className="w-full rounded-lg shadow"
          />
        )}
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-80 text-black relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute -top-4 -right-4 bg-white text-gray-700 hover:text-red-500 rounded-full p-2 shadow-md transition duration-200 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to delete this post?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-stone-300 rounded hover:bg-stone-400"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
