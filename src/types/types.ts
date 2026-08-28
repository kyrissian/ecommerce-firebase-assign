/**
 * Shape of a single product, as stored in Firestore's "products" collection.
 *
 * `id` is a string because Firestore auto-generates document IDs as strings
 * (e.g. "aBc123xYz") -- this used to be a number back when products came
 * from FakeStoreAPI, but changed as part of the Firestore migration.
 */
export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  /** Average rating and number of ratings, mirrors FakeStoreAPI's shape. */
  rating: {
    rate: number;
    count: number;
  };
}

/**
 * A product category is just a plain string (e.g. "electronics", "jewelery").
 * Categories aren't their own Firestore collection -- they're derived from
 * the `category` field on each product.
 */
export type Category = string;

/**
 * A product the user has added to their cart, with a quantity attached.
 * Inherits every field from Product (id, title, price, etc.) and adds
 * `quantity` on top.
 */
export interface CartItem extends Product {
  quantity: number;
}

/**
 * Shape of a completed order, as stored in Firestore's "orders" collection.
 *
 * Snapshots the cart at the moment of checkout -- items and their prices
 * are copied in as-is, rather than referencing live product documents,
 * so an order's history stays accurate even if a product's price or
 * details change later.
 */
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  /** Name of the person the order is being shipped to. Pre-filled from
   * the user's profile display name if set, but editable. */
  recipientName: string;
  shippingAddress: string;
  createdAt: string;
}
