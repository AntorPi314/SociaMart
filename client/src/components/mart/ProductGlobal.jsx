import React from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";

const ProductGlobal = ({
  id,
  name,
  price,
  priceOld,
  rating,
  left,
  images,
  description,
  hideShop
}) => {
  const handleBuyNow = () => {
    console.log("Buy Now clicked for:", name);
  };

  return (
    <div className="w-[242px] h-full bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 p-3 flex flex-col">
      
      {/* Store Info (optional) */}
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

        {/* Bottom Buttons */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100">
            <Heart className="w-5 h-5 text-gray-500" />
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
