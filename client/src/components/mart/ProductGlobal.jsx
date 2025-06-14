// src/components/mart/ProductGlobal.jsx
import React, { useEffect, useState } from "react";
import { ShoppingCart, Star, Heart as HeartOutline } from "lucide-react";
import axios from "axios";

const ProductGlobal = ({
  id,
  name,
  price,
  priceOld,
  rating,
  left,
  images,
  description,
  hideShop,
  wishlist,
  storeId,
  productId
}) => {
  const [isLiked, setIsLiked] = useState(wishlist || false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login to use wishlist");

    const endpoint = isLiked
      ? `http://localhost:3000/wishlist/remove/${storeId}/${productId}`
      : `http://localhost:3000/wishlist/add`;

    const payload = { productId, storeId };

    try {
      let res;
      if (isLiked) {
        // DELETE does not accept data payload as second argument, config only
        res = await axios.delete(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        res = await axios.post(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (res.data.success) {
        setIsLiked(!isLiked);
        console.log("✅ Wishlist updated");
      } else {
        console.warn("⚠️ Wishlist response failed", res.data);
      }
    } catch (err) {
      console.error("❌ Wishlist toggle error:", err?.response?.data || err.message);
    }
  };

  const handleBuyNow = () => {
    console.log("Buy Now clicked for:", name);
  };

  return (
    <div className="w-[242px] h-full bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 p-3 flex flex-col">
      {!hideShop && (
        <div className="flex items-center gap-1 text-sm text-gray-700 mb-2">
          <img
            src="https://img.icons8.com/ios-filled/50/store.png"
            alt="store"
            className="w-4 h-4"
          />
          <span className="font-medium">Best Buy Store</span>
          <span className="text-blue-500 font-semibold">• Follow</span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative">
        <img
          src={images?.[0] || "https://via.placeholder.com/300x200?text=Product"}
          alt={name}
          className="w-full h-36 object-cover rounded-md"
        />
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md">
          Only {left} Left
        </span>
        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
          {rating} <Star className="w-3 h-3 fill-white" />
        </span>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow mt-4">
        <h2 className="font-semibold text-sm text-gray-800 line-clamp-2 min-h-[42px]">
          {name}
        </h2>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-red-600 text-lg font-bold">${price}</span>
          <span className="text-gray-400 line-through text-sm">${priceOld}</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full border hover:bg-gray-100 transition ${
              isLiked ? "bg-red-100 border-red-300" : "border-gray-300"
            }`}
            title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isLiked ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 015.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <HeartOutline className="w-5 h-5 text-gray-500" />
            )}
          </button>

          <button
            className="flex items-center gap-2 bg-indigo-100 text-indigo-600 font-semibold px-4 py-2 rounded-xl hover:bg-indigo-200 transition"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="w-5 h-5" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductGlobal;
