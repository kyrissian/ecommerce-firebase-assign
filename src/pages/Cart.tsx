import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { calculateTotalPrice } from "../utils/calculations";
import "./Cart.css";

const Cart = () => {
  const { items, dispatch } = useCart();
  const navigate = useNavigate();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = calculateTotalPrice(items);

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id} className="cart-row">
              <Link to={`/products/${item.id}`} className="cart-image-link">
                <img src={item.image} alt={item.title} className="cart-image" />
              </Link>
              <div className="cart-details">
                <p className="cart-title">{item.title}</p>
                <p className="cart-price">${item.price.toFixed(2)} each</p>
              </div>

              <div className="cart-row-actions">
                <div className="cart-quantity">
                  <button
                    aria-label="Decrease quantity"
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
                    aria-label="Increase quantity"
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
