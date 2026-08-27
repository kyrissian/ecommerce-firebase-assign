import { useState } from "react";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/api";
import "./Cart.css";

/**
 * Shopping cart page. Displays items currently in the cart with
 * quantity controls and a remove button, collects a shipping address,
 * and places an order via createOrder() on checkout -- saving the
 * cart's contents to Firestore before clearing it, then showing a
 * confirmation screen with the new order's id.
 */
const Cart = () => {
  const { items, dispatch } = useCart();
  const { user } = useAuth();

  // Shipping address the user types in before checking out. Plain text,
  // not validated -- collected for realism, not real shipping/payment.
  const [shippingAddress, setShippingAddress] = useState("");

  // True while an order is being saved to Firestore -- disables the
  // Checkout button and shows a "Placing Order..." state, so it doesn't
  // feel like nothing happened when clicked.
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Holds the completed order's id once checkout succeeds, so we can
  // show a confirmation message. null means "no recent order to show."
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (!user || !shippingAddress.trim()) return;

    setIsCheckingOut(true);
    try {
      const orderId = await createOrder(user.uid, items, shippingAddress);
      dispatch({ type: "CLEAR_CART" });
      setConfirmedOrderId(orderId);
      setShippingAddress("");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Once an order's been confirmed, show a confirmation screen instead
  // of the (now-empty) cart, so the user gets clear feedback that
  // something actually happened.
  if (confirmedOrderId) {
    return (
      <div className="cart-page">
        <h1>Order Placed!</h1>
        <p>Your order ID is #{confirmedOrderId}</p>
        <button onClick={() => setConfirmedOrderId(null)}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id} className="cart-row">
              <img src={item.image} alt={item.title} className="cart-image" />
              <div className="cart-details">
                <p className="cart-title">{item.title}</p>
                <p className="cart-price">${item.price.toFixed(2)} each</p>
              </div>

              <div className="cart-quantity">
                <button
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_QUANTITY",
                      payload: { id: item.id, quantity: item.quantity - 1 },
                    })
                  }
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    dispatch({
                      type: "UPDATE_QUANTITY",
                      payload: { id: item.id, quantity: item.quantity + 1 },
                    })
                  }
                >
                  +
                </button>
              </div>

              <button
                className="remove-btn"
                onClick={() =>
                  dispatch({ type: "REMOVE_FROM_CART", payload: item.id })
                }
              >
                Remove
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <p>Total items: {totalItems}</p>
            <p className="cart-total">Total: ${totalPrice.toFixed(2)}</p>

            <label htmlFor="shipping-address">Shipping Address:</label>
            <input
              id="shipping-address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="123 Main St, Anytown, USA"
            />

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={isCheckingOut || !shippingAddress.trim()}
            >
              {isCheckingOut ? "Placing Order..." : "Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
