// src/components/Socia.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomPost from "./socia/customPost.jsx";
import CreatePost from "./socia/CreatePost.jsx";
import { User } from "lucide-react";



export default function Socia({ storeName }) {
  const [posts, setPosts] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (!storeName) return;

    setLoading(true);
    setError(null);

    async function fetchPosts() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(
          `https://sociamart.onrender.com/posts/${storeName}`,
          { headers }
        );

        if (res.data.success && Array.isArray(res.data.posts)) {
          const sortedPosts = res.data.posts.sort(
            (a, b) => new Date(b.createAt) - new Date(a.createAt)
          );
          setPosts(sortedPosts);
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

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Unknown date";

    const now = new Date();
    const past = new Date(dateString);
    const diff = (now - past) / 1000; // in seconds

    if (diff < 60) return `1m`; // Always show at least "1m", never seconds
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    const daysAgo = Math.floor(diff / 86400);
    if (daysAgo < 7) return `${daysAgo}d`;

    if (now.getFullYear() === past.getFullYear()) {
      return past.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
    }

    return past.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="h-full ml-2 flex flex-col rounded-xl overflow-hidden bg-white">
      <div className="h-20 flex items-center justify-between">
        <TopHeader
          isLoggedIn={isLoggedIn}
          onClickPost={() => setShowPostDialog(true)}
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-[#EDF0F9] rounded-2xl border-8 border-[#EDF0F9]">
        {loading && (
          <p className="text-center text-gray-500">Loading posts...</p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-gray-500">No posts found</p>
        )}

        {!loading &&
          !error &&
          posts.map((post) => {
            const timeAgo = getTimeAgo(post.createAt);

            return (
              <CustomPost
                key={post._id}
                owner_id={post.owner_id || "Anonymous"}
                name={post.owner_name || "Anonymous"}
                image={post.owner_profilePIC || "https://placehold.co/55x55"}
                likeCount={post.likeCount || 0}
                timeAgo={timeAgo}
                text={post.text}
                likedProp={post.liked}
                shopId={storeId}
                postId={post._id}
                onDelete={(deletedPostId) => {
                  setPosts((prevPosts) =>
                    prevPosts.filter((p) => p._id !== deletedPostId)
                  );
                }}
              />
            );
          })}
      </div>

      <CreatePost
        open={showPostDialog}
        onClose={() => setShowPostDialog(false)}
        storeName={storeName}
      />
    </div>
  );
}

function TopHeader({ isLoggedIn, onClickPost }) {
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem("token");

    async function fetchProfilePic() {
      try {
        const res = await axios.get("https://sociamart.onrender.com/profile/pic", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.profilePIC) {
          setProfilePic(res.data.profilePIC);
        }
      } catch (err) {
        console.error("Failed to fetch profile picture", err);
      }
    }

    fetchProfilePic();
  }, [isLoggedIn]);

  return (
    <div
      id="topHeader"
      className={`w-full h-14 bg-white rounded-xl border border-neutral-300 flex items-center px-4 gap-4 ${
        isLoggedIn ? "cursor-pointer hover:bg-neutral-100" : ""
      }`}
      onClick={() => isLoggedIn && onClickPost()}
    >
      {isLoggedIn ? (
        <img
          id="profilePic"
          src={profilePic || "https://placehold.co/40x40"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div
          id="profilePic"
          className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-500"
        >
          <User size={20} />
        </div>
      )}
      <p className="text-stone-400 text-base font-inter">
        {isLoggedIn ? "What's on your mind?" : "Login to post"}
      </p>
    </div>
  );
}
