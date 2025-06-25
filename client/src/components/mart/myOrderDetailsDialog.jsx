// src/components/mart/myOrderDetailsDialog.jsx
import { X } from "lucide-react";

export default function MyOrderDetailsDialog({ order, onClose }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-600 text-white";
      case "Cancel":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 max-w-md w-full rounded-xl relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
          aria-label="Close"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center">Order Details</h2>

        <img
          src={order.image || "/assets/default.jpg"}
          alt={order.title}
          className="w-full h-48 object-cover rounded-lg mb-6"
        />

        <table className="w-full text-sm table-auto border-separate border-spacing-y-2">
          <tbody className="text-gray-700">
            <tr>
              <td className="font-semibold w-1/3">Product</td>
              <td>{order.title}</td>
            </tr>
            <tr>
              <td className="font-semibold">Quantity</td>
              <td>{order.quantity}</td>
            </tr>
            <tr>
              <td className="font-semibold">Price</td>
              <td>৳ {order.price}</td>
            </tr>
            <tr>
              <td className="font-semibold">Status</td>
              <td>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
            <tr>
              <td className="font-semibold">Order ID</td>
              <td>{order._id}</td>
            </tr>
            <tr>
              <td className="font-semibold">Name</td>
              <td>{order.name}</td>
            </tr>
            <tr>
              <td className="font-semibold">Phone</td>
              <td>{order.phone}</td>
            </tr>
            <tr>
              <td className="font-semibold">Address</td>
              <td>{order.address}</td>
            </tr>
            <tr>
              <td className="font-semibold">Ordered on</td>
              <td>{new Date(order.createAt).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
