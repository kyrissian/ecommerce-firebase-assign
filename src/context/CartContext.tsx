import { useEffect, useReducer, type ReactNode } from "react";
import type { CartItem, Product } from "../types/types";
import { CartContext, type CartAction } from "./cartContextInstance";
import { useAuth } from "./useAuth";

function getCartKey(userId: string | undefined): string {
  return `cart_${userId ?? "guest"}`;
}

function loadCart(key: string): CartItem[] {
  try {
    const saved = sessionStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

  useEffect(() => {
    const key = getCartKey(user?.uid);
    dispatch({ type: "SET_CART", payload: loadCart(key) });
  }, [user?.uid]);

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
