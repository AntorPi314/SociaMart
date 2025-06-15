// src/components/Socia.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomPost from "./socia/customPost.jsx";

export default function Socia({ storeName }) {
  const [posts, setPosts] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // true if token exists

    if (!storeName) return;

    setLoading(true);
    setError(null);

    async function fetchPosts() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`http://localhost:3000/posts/${storeName}`, {
          headers,
        });

        if (res.data.success && Array.isArray(res.data.posts)) {
          setPosts(res.data.posts);
          setStoreId(res.data.storeId);
        } else {
          setPosts([]);
          setStoreId(null);
          setError("Failed to fetch posts");
        }
      } catch (err) {
        console.error("Post fetch failed:", err);
        setError("Error fetching posts");
        setPosts([]);
        setStoreId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [storeName]);

  return (
    <div className="w-[400px] h-full flex flex-col rounded-xl overflow-hidden bg-white">
      <div className="h-20 flex items-center justify-between">
        <TopHeader isLoggedIn={isLoggedIn} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 bg-[#EDF0F9] rounded-t-2xl border-t-8 border-[#EDF0F9]">
        {loading && <p className="text-center text-gray-500">Loading posts...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-gray-500">No posts found</p>
        )}

        {!loading &&
          !error &&
          posts.map((post) => {
            const timestamp = post.createAt?.t
              ? new Date(post.createAt.t * 1000)
              : null;

            const formattedDate = timestamp?.toLocaleDateString() || "Unknown date";
            const formattedTime = timestamp?.toLocaleTimeString() || "";

            return (
              <CustomPost
                key={post._id}
                name={post.owner_name || "Anonymous"}
                image={post.owner_profilePIC || "https://placehold.co/55x55"}
                meta={`${post.likeCount || 0} Liked | ${formattedDate} | ${formattedTime}`}
                text={post.text}
                likedProp={post.liked}
                shopId={storeId}
                postId={post._id}
              />
            );
          })}
      </div>
    </div>
  );
}

function TopHeader({ isLoggedIn }) {
  return (
    <div className="w-full h-14 bg-white rounded-xl border border-neutral-300 flex items-center px-4 gap-4">
      <div className="w-10 h-10 bg-stone-300 rounded-full" />
      <p className="text-stone-400 text-lg font-inter">
        {isLoggedIn ? "What's on your mind?" : "Login to post"}
      </p>
    </div>
  );
}
