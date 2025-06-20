// src/components/mart/showWishlistDialog.jsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import ProductGlobal from "./ProductGlobal";
import Toast from "../Toast";

export default function ShowWishlistDialog({ open, onClose }) {
  const [wishlistData, setWishlistData] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = "success") => {
    console.log("[Toast]", message, type);
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!open) return;

    const fetchWishlist = async () => {
      console.log("[Dialog] Fetching wishlist...");
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get("https://sociamart.onrender.com/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("[Dialog] API response:", res.data);

        if (Array.isArray(res.data) && res.data[0]?.success) {
          setWishlistData(res.data[0].wishlists || {});
        } else {
          showToast("Failed to load wishlist", "error");
          console.error("[Dialog] Unexpected response:", res.data);
        }
      } catch (err) {
        console.error("[Dialog] API Error:", err);
        showToast("Error loading wishlist", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [open]);

  if (!open) {
    console.log("[Dialog] Not open, returning null");
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 p-1.5 z-50 flex items-center justify-center"
        onClick={onClose} // close dialog on backdrop click
      >
        <div
          className="bg-white p-6 max-h-[90vh] overflow-y-auto rounded-2xl w-full max-w-5xl relative"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside dialog
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
            aria-label="Close wishlist dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-6 text-center select-none">
            Your Wishlist
          </h2>

          {/* Content */}
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : Object.keys(wishlistData).length === 0 ? (
            <p className="text-center text-gray-500">No wishlist items found.</p>
          ) : (
            <div className="space-y-12">
              {Object.entries(wishlistData).map(([storeId, { storeInfo, products }]) => (
                <div key={storeId}>
                  {/* Shop Header with full-width bg and clickable */}
                  <a
                    href={`/${storeInfo?.URL || storeInfo?.name}`}
                    className="flex items-center gap-3 mb-6 px-6 py-3 bg-gray-100 rounded-xl hover:underline max-w-full cursor-pointer select-none"
                    style={{ width: "100%" }}
                  >
                    <img
                      src={storeInfo?.profilePIC || "/assets/bx_store.svg"}
                      alt={`${storeInfo?.name || "Shop"} profile`}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <span className="font-semibold text-gray-800 text-lg">
                      {storeInfo?.name || "Shop"}
                    </span>
                  </a>

                  {/* Products grid - fixed width per product, centered */}
                  <div className="flex flex-wrap justify-center gap-6">
                    {Array.isArray(products) && products.length > 0 ? (
                      products.map((product) => (
                        <div key={product._id} className="w-[242px]">
                          <ProductGlobal
                            id={product._id}
                            name={product.title}
                            price={product.price}
                            priceOld={product.price_old}
                            rating={product.rating}
                            left={product.left}
                            images={product.images}
                            description={product.des}
                            wishlist={true}
                            storeId={storeId}
                            productId={product._id}
                            shopId={storeId}
                            hideShop={true}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center w-full">No products available.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
