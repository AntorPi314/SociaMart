// src/components/mart/myOrderDialog.jsx
import { useEffect, useState } from "react";
import { X, Star } from "lucide-react";
import axios from "axios";
import MyOrderDetailsDialog from "./myOrderDetailsDialog";
import Toast from "../Toast";

export default function MyOrderDialog({ open, onClose }) {
  const [orders, setOrders] = useState({});
  const [shopInfos, setShopInfos] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ratings, setRatings] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!open) return;

    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const res = await axios.get("https://sociamart.onrender.com/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ordersData = res.data.orders || {};
        Object.entries(ordersData).forEach(([_, storeOrders]) => {
          storeOrders.sort(
            (a, b) => new Date(b.createAt) - new Date(a.createAt)
          );
        });

        const sortedEntries = Object.entries(ordersData).sort((a, b) => {
          const dateA = new Date(a[1][0]?.createAt || 0);
          const dateB = new Date(b[1][0]?.createAt || 0);
          return dateB - dateA;
        });

        const sortedOrders = Object.fromEntries(sortedEntries);
        setOrders(sortedOrders);

        const shopIds = Object.keys(sortedOrders);
        const shopResponses = await Promise.all(
          shopIds.map((id) =>
            axios
              .get(`https://sociamart.onrender.com/stores/info/${id}`)
              .then((res) => res.data)
              .catch(() => null)
          )
        );

        const shopInfoMap = {};
        shopResponses.forEach((info, i) => {
          if (info) shopInfoMap[shopIds[i]] = info;
        });

        setShopInfos(shopInfoMap);
      } catch (err) {
        console.error(err);
        setToast({ message: "Failed to fetch orders", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [open]);

  const handleRatingSubmit = async (order, ratingValue) => {
    const token = localStorage.getItem("token");

    if (typeof ratingValue !== "number" || ratingValue < 1 || ratingValue > 5) {
      setToast({ message: "Invalid rating value", type: "error" });
      return;
    }

    const product_id = order?.product_id;
    const order_id = order?._id;
    const store_id = order?.storeId;

    if (!product_id || !order_id || !store_id) {
      setToast({ message: "Missing order or product info", type: "error" });
      return;
    }

    try {
      const res = await axios.post(
        "https://sociamart.onrender.com/rate-product",
        {
          product_id,
          order_id,
          store_id,
          rating: ratingValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setToast({ message: "Rating submitted", type: "success" });
        setOrders((prev) => {
          const updated = { ...prev };
          updated[store_id] = updated[store_id].map((o) =>
            o._id === order_id ? { ...o, ratingDone: true } : o
          );
          return updated;
        });
      } else {
        setToast({ message: "Failed to rate product", type: "error" });
      }
    } catch (err) {
      console.error("Rating error:", err?.response?.data || err.message);
      setToast({
        message: err?.response?.data?.message || "Error submitting rating",
        type: "error",
      });
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === "Delivered") return "bg-green-600 text-white";
    if (status === "Cancel") return "bg-red-600 text-white";
    return "bg-gray-600 text-white";
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full"
          >
            <X />
          </button>
          <h2 className="text-xl font-bold mb-4 text-center">My Orders</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : Object.keys(orders).length === 0 ? (
            <p className="text-center text-gray-500">You have no orders.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(orders).map(([storeId, storeOrders]) => {
                const shop = shopInfos[storeId] || {};
                return (
                  <div key={storeId} className="border p-4 rounded-xl">
                    <a
                      href={`/${shop.URL || storeId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 mb-4"
                    >
                      <img
                        src={shop.profilePIC || "/assets/bx_store.svg"}
                        alt="Shop"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-semibold text-lg text-blue-700 hover:underline">
                        {shop.name || "Unnamed Shop"}
                      </span>
                    </a>

                    <div className="space-y-3">
                      {storeOrders.map((order) => (
                        <div
                          key={order._id}
                          className="bg-gray-50 p-3 rounded-md shadow-sm space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={order.image || "/assets/placeholder.png"}
                                alt="Product"
                                className="w-12 h-12 rounded object-cover border"
                              />
                              <div>
                                <p className="text-sm font-medium">
                                  {order.title}
                                </p>
                                <span
                                  className={`inline-block text-xs px-3 py-1 rounded-full mt-1 ${getStatusBadgeClass(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(order.createAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setSelectedOrder({ ...order, storeId })
                              }
                              className="text-sm bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                            >
                              View
                            </button>
                          </div>

                          {order.status === "Delivered" &&
                            !order.ratingDone && (
                              <div className="flex items-center gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-5 h-5 cursor-pointer ${
                                      ratings[order._id] >= star
                                        ? "fill-yellow-500"
                                        : "stroke-yellow-500"
                                    }`}
                                    onClick={() =>
                                      setRatings((prev) => ({
                                        ...prev,
                                        [order._id]: star,
                                      }))
                                    }
                                  />
                                ))}
                                {ratings[order._id] && (
                                  <button
                                    onClick={() =>
                                      handleRatingSubmit(
                                        { ...order, storeId },
                                        ratings[order._id]
                                      )
                                    }
                                    className="text-sm ml-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                  >
                                    Submit
                                  </button>
                                )}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <MyOrderDetailsDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
