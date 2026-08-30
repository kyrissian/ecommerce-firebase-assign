import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/api";
import "./Checkout.css";

/**
 * Dedicated checkout page, separate from the Cart page itself --
 * mirroring how real ecommerce sites split "review your cart" from
 * "enter shipping details and place the order" into two distinct steps.
 *
 * Collects a recipient name (pre-filled from the user's profile display
 * name, if set) and shipping address, then saves the order via
 * createOrder() and shows a confirmation screen with the new order's id.
 */
const Checkout: React.FC = () => {
  const { items, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipientName, setRecipientName] = useState(user?.displayName ?? "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handlePlaceOrder = async () => {
    if (!user || !recipientName.trim() || !shippingAddress.trim()) return;

    setIsPlacingOrder(true);
    try {
      const orderId = await createOrder(
        user.uid,
        items,
        recipientName,
        shippingAddress,
      );
      dispatch({ type: "CLEAR_CART" });
      setConfirmedOrderId(orderId);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (confirmedOrderId) {
    return (
      <div className="checkout-page">
        <div className="order-confirmation">
          <h1>Order Placed!</h1>
          <p>Your order ID is #{confirmedOrderId}</p>
          <button onClick={() => navigate("/")}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  // Nothing to check out -- shouldn't normally be reachable (Cart's
  // "Proceed to Checkout" button only shows when items exist), but
  // protects against someone navigating here directly with an empty cart.
  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <p>Your cart is empty.</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-content">
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="checkout-summary-row">
              <img
                src={item.image}
                alt={item.title}
                className="checkout-summary-image"
              />
              <span>{item.title}</span>
              <span className="checkout-summary-qty">× {item.quantity}</span>
              <span className="checkout-summary-price">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="checkout-summary-total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="shipping-section">
          <h2 className="shipping-heading">Shipping Details</h2>

          <div className="shipping-field">
            <label htmlFor="recipient-name">Name</label>
            <input
              id="recipient-name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="shipping-field">
            <label htmlFor="shipping-address">Address</label>
            <input
              id="shipping-address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="123 Main St, Anytown, USA"
            />
          </div>

          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={
              isPlacingOrder || !recipientName.trim() || !shippingAddress.trim()
            }
          >
            {isPlacingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
