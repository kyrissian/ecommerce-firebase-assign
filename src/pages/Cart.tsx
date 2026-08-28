import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import "./Cart.css";

/**
 * Shopping cart review page. Displays items currently in the cart with
 * quantity controls and a remove button. "Add More Items" and "Proceed
 * to Checkout" sit side by side at the bottom -- checking out itself is
 * a separate step, handled on the /checkout page.
 */
const Cart = () => {
  const { items, dispatch } = useCart();
  const navigate = useNavigate();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

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

          <div className="cart-bottom-row">
            <Link to="/" className="continue-shopping-btn">
              ← Add More Items
            </Link>

            <div className="cart-summary">
              <p>Total items: {totalItems}</p>
              <p className="cart-total">Total: ${totalPrice.toFixed(2)}</p>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
