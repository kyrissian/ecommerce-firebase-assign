import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserOrders } from "../api/api";
import { useAuth } from "../context/AuthContext";
import type { Order } from "../types/types";
import "./OrderHistory.css";

/**
 * Displays a logged-in user's past orders, newest first. Each order
 * shows a summary row (id, date, total) that expands in place to show
 * full details (item thumbnails, quantities, prices, shipping address)
 * when clicked.
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
    enabled: !!user,
  });

  // Sort newest-first by createdAt. Done here, client-side, rather than
  // adding an orderBy to the Firestore query itself -- combining our
  // existing "where userId ==" filter with an orderBy would require
  // creating a composite index in the Firebase console, which is extra
  // manual setup. Sorting the already-fetched (typically small) list
  // in JS avoids that entirely.
  const sortedOrders = orders
    ? [...orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : [];

  if (!user) {
    return <p>You must be logged in to view this page.</p>;
  }

  return (
    <div className="order-history-page">
      <h1>Order History</h1>

      {isLoading && <p>Loading orders...</p>}
      {error && <p>Error loading orders.</p>}
      {sortedOrders.length === 0 && !isLoading && (
        <p>You haven't placed any orders yet.</p>
      )}

      <ul className="order-list">
        {sortedOrders.map((order: Order) => (
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
                    <li key={item.id} className="order-item-row">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="order-item-image"
                      />
                      <span>{item.title}</span>
                      <span className="order-item-qty">× {item.quantity}</span>
                      <span className="order-item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
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
