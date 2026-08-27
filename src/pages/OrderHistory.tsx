import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserOrders } from "../api/api";
import { useAuth } from "../context/AuthContext";
import type { Order } from "../types/types";
import "./OrderHistory.css";

/**
 * Displays a logged-in user's past orders. Each order shows a summary
 * row (id, date, total) that expands in place to show full details
 * (items, quantities, shipping address) when clicked.
 */
const OrderHistory: React.FC = () => {
  const { user } = useAuth();

  // Tracks which order (if any) is currently expanded. null means
  // "nothing expanded" -- clicking the same order again collapses it.
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", user?.uid],
    queryFn: () => fetchUserOrders(user!.uid),
    // Only actually run this query once we know who the logged-in user
    // is -- prevents an unnecessary/invalid fetch while auth is still
    // resolving.
    enabled: !!user,
  });

  if (!user) {
    return <p>You must be logged in to view this page.</p>;
  }

  return (
    <div className="order-history-page">
      <h1>Order History</h1>

      {isLoading && <p>Loading orders...</p>}
      {error && <p>Error loading orders.</p>}
      {orders?.length === 0 && <p>You haven't placed any orders yet.</p>}

      <ul className="order-list">
        {orders?.map((order: Order) => (
          <li key={order.id} className="order-item">
            <div
              className="order-summary"
              onClick={() =>
                setExpandedOrderId(
                  expandedOrderId === order.id ? null : order.id,
                )
              }
            >
              <span>Order #{order.id}</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>

            {expandedOrderId === order.id && (
              <div className="order-details">
                <p>Shipping to: {order.shippingAddress}</p>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.title} — Qty: {item.quantity} — $
                      {(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderHistory;
