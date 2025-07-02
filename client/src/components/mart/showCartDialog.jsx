// src/components/mart/showCartDialog.jsx
import { useEffect, useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import axios from "axios";
import Toast from "../Toast";
import ProductDialog from "../mart/ProductDialog"; // ✅

export default function ShowCartDialog({ open, onClose }) {
  const [cartData, setCartData] = useState({});
  const [quantities, setQuantities] = useState({});
  const [selected, setSelected] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productDialog, setProductDialog] = useState(null);

  // ✅ Load from localStorage on first load
  useEffect(() => {
    const savedQuantities = JSON.parse(localStorage.getItem("cart_quantities") || "{}");
    const savedSelected = JSON.parse(localStorage.getItem("cart_selected") || "{}");
    setQuantities(savedQuantities);
    setSelected(savedSelected);
  }, []);

  // ✅ Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart_quantities", JSON.stringify(quantities));
  }, [quantities]);

  useEffect(() => {
    localStorage.setItem("cart_selected", JSON.stringify(selected));
  }, [selected]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCart = async () => {
    if (!open) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("https://sociamart.onrender.com/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data) && res.data[0]?.success) {
        const data = res.data[0].cart || {};
        setCartData(data);

        // merge saved with fetched data
        const newQuantities = { ...quantities };
        const newSelected = { ...selected };

        Object.entries(data).forEach(([storeId, { products }]) => {
          products.forEach((p) => {
            const key = `${storeId}_${p._id}`;
            if (!(key in newQuantities)) newQuantities[key] = p.quantity || 1;
            if (!(key in newSelected)) newSelected[key] = false;
          });
        });

        setQuantities(newQuantities);
        setSelected(newSelected);
      } else {
        showToast("Failed to load cart", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading cart", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [open]);

  const updateQuantity = (storeId, productId, delta) => {
    const key = `${storeId}_${productId}`;
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, (prev[key] || 1) + delta),
    }));
  };

  const toggleSelect = (storeId, productId) => {
    const key = `${storeId}_${productId}`;
    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const removeFromCart = async (storeId, productId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://sociamart.onrender.com/cart/remove/${storeId}/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Removed from cart");
      fetchCart();
    } catch (err) {
      console.error(err);
      showToast("Failed to remove product", "error");
    }
  };

  const proceedToOrder = async () => {
    const token = localStorage.getItem("token");
    const orders = {};

    for (const [storeId, { products }] of Object.entries(cartData)) {
      const filtered = products.filter((p) => selected[`${storeId}_${p._id}`]);
      if (!filtered.length) continue;

      orders[storeId] = filtered.map((p) => ({
        productId: p._id,
        quantity: quantities[`${storeId}_${p._id}`] || 1,
      }));
    }

    if (Object.keys(orders).length === 0) {
      showToast("No product selected", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        "https://sociamart.onrender.com/order",
        { orders },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showToast("Order placed successfully");
        onClose();
      } else {
        showToast(res.data?.message || "Order failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Order error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalSelectedPrice = Object.entries(cartData).reduce((total, [storeId, { products }]) => {
    return (
      total +
      products.reduce((sum, p) => {
        const key = `${storeId}_${p._id}`;
        if (!selected[key]) return sum;
        return sum + (p.price || 0) * (quantities[key] || 1);
      }, 0)
    );
  }, 0);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 p-1.5 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 max-h-[90vh] overflow-y-auto rounded-2xl w-full max-w-5xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
            aria-label="Close cart dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-center select-none">Your Cart</h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : Object.keys(cartData).length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              <div className="space-y-12">
                {Object.entries(cartData).map(([storeId, { storeInfo, products }]) => (
                  <div key={storeId}>
                    <a
                      href={`/${storeInfo?.URL || storeInfo?.name}`}
                      className="flex items-center gap-3 mb-6 px-6 py-3 bg-gray-100 rounded-xl hover:underline"
                    >
                      <img
                        src={storeInfo?.profilePIC || "/assets/bx_store.svg"}
                        alt={storeInfo?.name || "Shop"}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold text-gray-800 text-lg">
                        {storeInfo?.name || "Shop"}
                      </span>
                    </a>

                    <div className="space-y-4">
                      {products.map((product) => {
                        const key = `${storeId}_${product._id}`;
                        const quantity = quantities[key] || 1;

                        return (
                          <div
                            key={product._id}
                            className={`flex items-center gap-4 rounded-xl p-4 drop-shadow-sm transition-all ${selected[key] ? "bg-green-100 border-green-200" : "bg-white"}`}
                          >
                            <input
                              type="checkbox"
                              checked={!!selected[key]}
                              onChange={() => toggleSelect(storeId, product._id)}
                              className="accent-green-600 w-5 h-5"
                            />
                            <img
                              src={product.images?.[0] || "/assets/default.jpg"}
                              alt={product.title}
                              className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                              onClick={() =>
                                setProductDialog({
                                  id: product._id,
                                  name: product.title,
                                  price: product.price,
                                  priceOld: product.price_old,
                                  rating: product.rating,
                                  left: product.left,
                                  images: product.images,
                                  description: product.des,
                                })
                              }
                            />
                            <div className="flex-grow">
                              <h3 className="font-semibold text-base mb-1 text-gray-800 max-w-[140px] sm:max-w-full truncate">
                                {product.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                ৳ {product.price} × {quantity} = <span className="font-medium text-gray-800">৳ {product.price * quantity}</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                                  onClick={() => updateQuantity(storeId, product._id, -1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{quantity}</span>
                                <button
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                                  onClick={() => updateQuantity(storeId, product._id, 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <button
                              className="text-red-600 hover:text-red-700"
                              onClick={() => removeFromCart(storeId, product._id)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <p className="text-xl font-semibold mb-4 text-gray-800">
                  Total: <span className="text-green-600">৳ {totalSelectedPrice}</span>
                </p>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-md transition-all"
                  onClick={proceedToOrder}
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : <><ShoppingBag className="inline-block mr-2" />Place Order</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {productDialog && (
        <ProductDialog {...productDialog} onClose={() => setProductDialog(null)} />
      )}
    </>
  );
}
