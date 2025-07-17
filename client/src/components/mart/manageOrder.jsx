import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import axios from "axios";
import Toast from "../Toast";

const STATUS_OPTIONS = ["Cancel", "Processing", "Confirm", "Delivered"];

export default function ManageOrder({ open, onClose, shopId }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const searchTimeout = useRef(null);

  useEffect(() => {
    if (!open || !shopId) return;

    const fetchOrders = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `http://localhost:3000/manage-orders/${shopId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.success) {
          setOrders(res.data.orders);
          setFilteredOrders(res.data.orders);
        } else {
          setToast({
            message: res.data.message || "Failed to load orders",
            type: "error",
          });
          setOrders([]);
          setFilteredOrders([]);
        }
      } catch (err) {
        console.error(err);
        setToast({ message: "Error fetching orders", type: "error" });
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [open, shopId]);

  useEffect(() => {
    if (!shopId) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      const trimmed = searchTerm.trim();

      if (!trimmed) {
        setFilteredOrders(orders);
        return;
      }

      if (trimmed.length >= 6) {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
          const res = await axios.get(
            `http://localhost:3000/manage-orders/${shopId}/search-order/${trimmed}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.data?.success && res.data.order) {
            setFilteredOrders([res.data.order]);
          } else {
            setFilteredOrders([]);
            setToast({ message: "No order found with that ID", type: "info" });
          }
        } catch (err) {
          console.error(err);
          setToast({ message: "Error searching order", type: "error" });
          setFilteredOrders([]);
        } finally {
          setLoading(false);
        }
      } else {
        const lowerSearch = trimmed.toLowerCase();
        setFilteredOrders(
          orders.filter((order) =>
            order._id.toString().toLowerCase().includes(lowerSearch)
          )
        );
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, orders, shopId]);

  const handleStatusUpdate = async () => {
    if (!editingOrder || !newStatus) return;

    const token = localStorage.getItem("token");

    try {
      const res = await axios.patch(
        `http://localhost:3000/update-order-status/${shopId}/${editingOrder._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setToast({ message: "Status updated", type: "success" });

        setOrders((prev) =>
          prev.map((o) =>
            o._id === editingOrder._id ? { ...o, status: newStatus } : o
          )
        );

        setFilteredOrders((prev) =>
          prev.map((o) =>
            o._id === editingOrder._id ? { ...o, status: newStatus } : o
          )
        );

        setEditingOrder(null);
        setNewStatus("");
      } else {
        setToast({
          message: res.data.message || "Failed to update status",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Error updating status", type: "error" });
    }
  };

  const getStatusStyle = (status) => {
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
            aria-label="Close"
          >
            <X />
          </button>

          <h2 className="text-xl font-bold mb-4 text-center">Manage Orders</h2>

          <input
            type="text"
            placeholder="Search by Order ID"
            className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500">No orders found.</p>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={order.image || "/assets/default.jpg"}
                      alt={order.title}
                      className="w-24 h-24 object-cover rounded-md border"
                    />
                    <div>
                      <p className="font-semibold text-lg">{order.title}</p>
                      <p className="text-gray-600">
                        Quantity: {order.quantity}
                      </p>
                      <p className="text-gray-600">Price: ৳{order.price}</p>
                      <p className="text-gray-600">Name: {order.name}</p>
                      <p className="text-gray-600">Phone: {order.phone}</p>
                      <p className="text-gray-600">Address: {order.address}</p>
                      <p className="text-gray-500 text-sm">
                        Order ID: {order._id}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Create at: {new Date(order.createAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-2">
                    <button
                      onClick={() => {
                        setEditingOrder(order);
                        setNewStatus(order.status);
                      }}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editingOrder && (
            <div
              className="fixed inset-0 bg-black/30 flex items-center justify-center z-60"
              onClick={() => {
                setEditingOrder(null);
                setNewStatus("");
              }}
            >
              <div
                className="bg-white p-6 rounded-lg w-80"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold mb-4">Update Status</h3>
                <p className="mb-2 font-semibold">{editingOrder.title}</p>
                <select
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => {
                      setEditingOrder(null);
                      setNewStatus("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleStatusUpdate}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
