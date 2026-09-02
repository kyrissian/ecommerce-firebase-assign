import type { CartItem } from "../types/types";

/**
 * Sums each item's price × quantity to get the cart/order total.
 * Shared between Cart, Checkout, and createOrder (api.ts) so this
 * calculation lives in exactly one place rather than being repeated
 * with the risk of one copy drifting from the others.
 */
export const calculateTotalPrice = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);
