// src/components/socia/customPost.jsx

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-words"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function CustomPost({
  name,
  image,
  meta,
  text,
  likedProp,
  shopId,
  postId,
}) {
  console.log("🔍 PROPS RECEIVED:", {
    name,
    image,
    meta,
    text,
    likedProp,
    shopId,
    postId,
  });

  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set liked value from props on first render
  useEffect(() => {
    setLiked(likedProp);
  }, [likedProp]);

  const toggleLiked = async () => {
    if (!shopId || !postId || loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      const url = liked
        ? "http://localhost:3000/like/remove"
        : "http://localhost:3000/like/add";

      console.log("📤 Sending request to:", url, { shopId, postId });

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

      setLiked((prev) => !prev);
    } catch (error) {
      console.error("Like toggle failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-300 rounded-2xl p-4 mb-2 shadow-sm space-y-3 font-sans">
      <div className="flex items-start gap-3">
        <img
          src={image}
          alt={`${name} profile`}
          className="w-[48px] h-[48px] rounded-full shadow"
        />
        <div className="flex-1 flex flex-col">
          <p className="text-zinc-900 font-bold text-sm leading-5">{name}</p>
          <p className="text-stone-500 text-xs leading-4">{meta}</p>
        </div>
        <button
          onClick={toggleLiked}
          disabled={loading}
          aria-label={liked ? "Unlike post" : "Like post"}
          className="flex items-center focus:outline-none"
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
    </div>
  );
}
