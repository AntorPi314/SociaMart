// src/components/mart/myOrderDetailsDialog.jsx
import { X } from "lucide-react";

export default function MyOrderDetailsDialog({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2" onClick={onClose}>
      <div className="bg-white p-6 max-w-md w-full rounded-xl relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full">
          <X />
        </button>
        <h2 className="text-xl font-bold mb-4">Order Details</h2>

        <img
          src={order.image || "/assets/default.jpg"}
          alt={order.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <p className="font-semibold">{order.title}</p>
        <p className="text-sm">Quantity: {order.quantity}</p>
        <p className="text-sm">Price: ৳ {order.price}</p>
        <p className="text-sm">Status: {order.status}</p>
        <p className="text-sm">Order ID: {order._id}</p>
        <p className="text-sm">Address: {order.address}</p>
        <p className="text-sm">Phone: {order.phone}</p>
        <p className="text-xs text-gray-500 mt-2">Ordered on: {new Date(order.createAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
