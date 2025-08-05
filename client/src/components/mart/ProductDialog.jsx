// src/components/ProductDialog.jsx

import React, { useState } from "react";
import { Star, X, ChevronLeft, ChevronRight } from "lucide-react";

const ProductDialog = ({
  onClose,
  id,
  name,
  price,
  priceOld,
  rating,
  left,
  images = [],
  description,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentImage =
    images?.[currentIndex] ||
    "https://via.placeholder.com/400x300?text=Product";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 p-6 relative text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white text-gray-700 hover:text-red-500 rounded-full p-2 shadow-md transition duration-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Carousel */}
        <div className="relative mb-4">
          <img
            src={currentImage}
            alt={`Product Image ${currentIndex + 1}`}
            className="w-full h-72 object-contain rounded-md bg-gray-100"
          />

          {/* Left & Right Arrows */}
          {images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-white p-1 rounded-full shadow hover:bg-gray-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentIndex < images.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-white p-1 rounded-full shadow hover:bg-gray-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Product Title */}
        <h2 className="text-xl font-bold mb-2">{name}</h2>

        {/* Rating & Stock */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-yellow-500">
            <Star className="w-4 h-4 fill-yellow-400" />
            {rating} rating
          </div>
          {left < 10 && (
            <span className="text-sm text-red-600 font-medium">
              Only {left} left!
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-lg font-bold text-red-600">${price}</span>
          {priceOld && (
            <span className="text-sm line-through text-gray-500">
              ${priceOld}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default ProductDialog;
