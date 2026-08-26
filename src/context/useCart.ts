import { useContext } from "react";
import { CartContext } from "./cartContextInstance";

/**
 * Custom hook for accessing the cart context. Throws if used outside
 * of a CartProvider, so misuse is caught immediately during development.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
