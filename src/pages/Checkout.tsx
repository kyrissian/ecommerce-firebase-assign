import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";
import { createOrder } from "../api/api";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { toast } from "react-toastify";
import { isValidPhone } from "../utils/validators";
import { calculateTotalPrice } from "../utils/calculations";
import "./Checkout.css";

const Checkout: React.FC = () => {
  const { items, dispatch } = useCart();
  const { user, profile, setProfile, authLoading } = useAuth();
  const navigate = useNavigate();

  const [recipientName, setRecipientName] = useState(user?.displayName ?? "");
  const [shippingAddress, setShippingAddress] = useState(
    profile?.address ?? "",
  );
  const [phone, setPhone] = useState(profile?.phone ?? "");

  // Tracks whether the person has manually clicked the "save to
  // profile" checkbox themselves. null means "not touched yet" -- in
  // that state, whether the box appears checked is calculated fresh
  // on every render (see saveContactToProfile below) rather than
  // stored and synced via a separate effect, which React's linter
  // flags as a pattern prone to extra unnecessary re-renders. Once the
  // person clicks it directly, their explicit true/false choice takes
  // over and we stop recalculating it for them.
  const [manualCheckboxOverride, setManualCheckboxOverride] = useState<
    boolean | null
  >(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.info("Please log in to check out.");
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const hasNoSavedContact = !profile?.address && !profile?.phone;
  const addressChanged = shippingAddress !== (profile?.address ?? "");
  const phoneChanged = phone !== (profile?.phone ?? "");

  // Derived directly during render, not via useEffect + setState:
  // if the person hasn't manually touched the checkbox, suggest
  // checking it whenever they have no saved contact info yet, or
  // whenever what they've typed differs from what's already saved.
  const saveContactToProfile =
    manualCheckboxOverride !== null
      ? manualCheckboxOverride
      : hasNoSavedContact || addressChanged || phoneChanged;

  const totalPrice = calculateTotalPrice(items);

  const handlePlaceOrder = async () => {
    if (!user || !recipientName.trim() || !shippingAddress.trim()) return;

    if (phone && !isValidPhone(phone)) {
      toast.error("Phone number must be in the format xxx-xxx-xxxx.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderId = await createOrder(
        user.uid,
        items,
        recipientName,
        shippingAddress,
      );

      if (saveContactToProfile) {
        await updateDoc(doc(db, "users", user.uid), {
          address: shippingAddress,
          phone,
        });
        setProfile(
          profile ? { ...profile, address: shippingAddress, phone } : null,
        );
      }

      dispatch({ type: "CLEAR_CART" });
      setConfirmedOrderId(orderId);
      toast.success("Order placed successfully!");
    } catch (error: unknown) {
      console.error("Failed to place order:", error);
      toast.error("Something went wrong placing your order. Please try again.");
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

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="order-confirmation">
          <h1>Your Cart is Empty</h1>
          <p>Add something to your cart before checking out.</p>
          <button onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </div>
    );
  }

  const hasSavedContact = !!(profile?.address || profile?.phone);

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

          <div className="shipping-field">
            <label htmlFor="shipping-phone">Phone Number</label>
            <input
              id="shipping-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="xxx-xxx-xxxx"
            />
          </div>

          <div className="save-address-checkbox">
            <input
              id="save-address"
              type="checkbox"
              checked={saveContactToProfile}
              onChange={(e) => setManualCheckboxOverride(e.target.checked)}
            />
            <label htmlFor="save-address">
              {hasSavedContact
                ? "Update my saved profile with this address and phone"
                : "Save this address and phone to my profile"}
            </label>
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
