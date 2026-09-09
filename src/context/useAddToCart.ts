import { toast } from "react-toastify";
import type { Product } from "../types/types";
import { useCart } from "./useCart";

/**
 * Returns a function that adds a product to the cart and shows a
 * confirmation toast. Both ProductCard (the grid) and ProductDetail
 * (the standalone product page) need this exact same "dispatch
 * ADD_TO_CART, then confirm with a toast" behavior for their own Add
 * to Cart buttons -- pulling it out here keeps that logic in one
 * place instead of two copies that could quietly drift apart (e.g.
 * one getting a toast tweak the other doesn't).
 */
export const useAddToCart = () => {
  const { dispatch } = useCart();

  return (product: Product) => {
    dispatch({ type: "ADD_TO_CART", payload: product });
    toast.success(`Added "${product.title}" to cart`);
  };
};
