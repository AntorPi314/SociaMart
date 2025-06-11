import React from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";

const ProductCard = () => {
  const handleBuyNow = () => {
    console.log("Buy Now clicked for All-Black Street Style Sneakers");
  };

  return (
    <div className="max-w-xs m-1  bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <img
            src="https://img.icons8.com/ios-filled/50/store.png"
            alt="store"
            className="w-4 h-4"
          />
          <span className="font-medium">Best Buy Store</span>
          <span className="text-blue-500 font-semibold">• Follow</span>
        </div>
      </div>

      <div className="relative">
        <img
          src="https://via.placeholder.com/300x200?text=Sneakers"
          alt="Sneakers"
          className="w-full h-40 object-cover rounded-md"
        />
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md">
          Only 3 Left
        </span>
        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
          4.5 <Star className="w-3 h-3 fill-white" />
        </span>
      </div>

      <div className="mt-4">
        <h2 className="font-semibold text-lg text-gray-800">
          All-Black Street Style Sneakers
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-red-600 text-xl font-bold">250$</span>
          <span className="text-gray-400 line-through text-sm">270$</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
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
  );
};

export default ProductCard;
