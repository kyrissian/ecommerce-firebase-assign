import { useEffect, useReducer, type ReactNode } from "react";
import type { CartItem, Product } from "../types/types";
import { CartContext, type CartAction } from "./cartContextInstance";
import { useAuth } from "./AuthContext";

/**
 * Builds the sessionStorage key for a given user, so each logged-in
 * user (and guests) gets their own separate cart.
 */
function getCartKey(userId: string | undefined): string {
  return `cart_${userId ?? "guest"}`;
}

/**
 * Reads and validates cart items from sessionStorage for a given key.
 * Falls back to an empty array if nothing is saved or the data is
 * malformed, so a corrupted or manually-edited value can't crash the app.
 */
function loadCart(key: string): CartItem[] {
  try {
    const saved = sessionStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves cart items to sessionStorage under the given key. Fails
 * silently if storage is unavailable, since the cart still works
 * fine in-memory for the rest of the session.
 */
function saveCart(key: string, items: CartItem[]): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Storage unavailable or full — cart still works in-memory.
  }
}

interface CartState {
  items: CartItem[];
}

/**
 * Reducer handling every cart action. Each case returns a brand-new
 * state object rather than mutating the existing one, which is required
 * for React to correctly detect the state changed and re-render.
 */
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const product = action.payload as Product;
      // If this product's already in the cart, just bump its quantity
      // instead of adding a duplicate entry.
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      // New product -- add it to the cart with a starting quantity of 1.
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }

    // Removes an item from the cart entirely, regardless of its
    // current quantity.
    case "REMOVE_FROM_CART":
      return {
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      // Dropping quantity to zero (or below, e.g. clicking "-" at 1)
      // removes the item entirely, same as REMOVE_FROM_CART, rather
      // than leaving a 0-quantity item sitting in the cart.
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== id) };
      }
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        ),
      };
    }

    // Empties the cart completely -- used after a successful checkout.
    case "CLEAR_CART":
      return { items: [] };

    // Replaces the entire cart wholesale -- used when loading a
    // different user's saved cart from sessionStorage (see the
    // useEffect below that fires on login/logout).
    case "SET_CART":
      return { items: action.payload };

    default:
      throw new Error(`Unhandled action type: ${(action as CartAction).type}`);
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Whenever the logged-in user changes (login/logout), load that
  // user's own cart from sessionStorage instead of sharing one cart
  // across accounts.
  useEffect(() => {
    const key = getCartKey(user?.uid);
    dispatch({ type: "SET_CART", payload: loadCart(key) });
  }, [user?.uid]);

  // Persist to sessionStorage under the current user's key any time
  // the cart contents change.
  useEffect(() => {
    const key = getCartKey(user?.uid);
    saveCart(key, state.items);
  }, [state.items, user?.uid]);

  return (
    <CartContext.Provider value={{ items: state.items, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
