import { createContext } from "react";
import type { CartItem } from "../types/types";

/**
 * `id` fields here are strings, not numbers -- matches Product.id, which
 * changed from number to string as part of the Firestore migration
 * (Firestore auto-generates string document IDs).
 */
export type CartAction =
  | { type: "ADD_TO_CART"; payload: import("../types/types").Product }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART"; payload: CartItem[] };

export interface CartContextType {
  items: CartItem[];
  dispatch: React.Dispatch<CartAction>;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);
