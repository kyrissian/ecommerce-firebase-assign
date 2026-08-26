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

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const product = action.payload as Product;
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
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }
    case "REMOVE_FROM_CART":
      return {
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== id) };
      }
      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        ),
      };
    }
    case "CLEAR_CART":
      return { items: [] };
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
