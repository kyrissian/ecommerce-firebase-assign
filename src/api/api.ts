import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import type { CartItem, Order, Product } from "../types/types";

/**
 * Fetches every product from the "products" collection in Firestore.
 *
 * Firestore's getDocs() returns a QuerySnapshot, not the raw data
 * directly -- each document's actual fields live under docSnap.data().
 * We combine that with docSnap.id (Firestore's auto-generated document
 * ID) to rebuild a full Product object, since Firestore keeps a
 * document's ID separate from its data on purpose.
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Product[];
};

/**
 * Derives the list of unique product categories from Firestore.
 *
 * FakeStoreAPI had a dedicated categories endpoint, but Firestore has no
 * equivalent -- categories aren't their own collection here, just a field
 * on each product. So we fetch all products and pull out the distinct
 * category values using a Set, which automatically discards duplicates.
 */
export const fetchCategories = async (): Promise<string[]> => {
  const products = await fetchProducts();
  const uniqueCategories = new Set(products.map((product) => product.category));
  return Array.from(uniqueCategories);
};

/**
 * Adds a new product to the "products" collection in Firestore.
 *
 * We don't pass an `id` in -- Firestore generates the document's id
 * automatically when addDoc() creates it, so the input type excludes
 * id using Omit<Product, "id">.
 */
export const createProduct = async (
  product: Omit<Product, "id">,
): Promise<void> => {
  await addDoc(collection(db, "products"), product);
};

/**
 * Updates an existing product in Firestore by its document id.
 *
 * `doc(db, "products", id)` points at one specific document inside the
 * "products" collection (as opposed to `collection(...)`, which points
 * at the whole collection). `updates` is a Partial type, meaning you can
 * pass just the fields you want to change -- e.g. only `{ price: 24.99 }`
 * -- without needing to supply the entire product object again.
 */
export const updateProduct = async (
  id: string,
  updates: Partial<Omit<Product, "id">>,
): Promise<void> => {
  const productRef = doc(db, "products", id);
  await updateDoc(productRef, updates);
};

/**
 * Deletes a product from Firestore by its document id.
 */
export const deleteProduct = async (id: string): Promise<void> => {
  const productRef = doc(db, "products", id);
  await deleteDoc(productRef);
};

/**
 * Saves a completed order to Firestore's "orders" collection.
 *
 * Takes the user's id and their current cart items, calculates the
 * total, and stamps the current time as createdAt. Firestore assigns
 * the order's own document id automatically.
 */
export const createOrder = async (
  userId: string,
  items: CartItem[],
  shippingAddress: string,
): Promise<string> => {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const orderRef = await addDoc(collection(db, "orders"), {
    userId,
    items,
    totalPrice,
    shippingAddress,
    createdAt: new Date().toISOString(),
  });

  return orderRef.id;
};

/**
 * Fetches only the orders belonging to a specific user, sorted by
 * userId via a Firestore "where" query -- rather than fetching every
 * order in the whole collection and filtering client-side, which
 * wouldn't scale once many users have placed orders.
 */
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  const ordersQuery = query(
    collection(db, "orders"),
    where("userId", "==", userId),
  );
  const querySnapshot = await getDocs(ordersQuery);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Order[];
};
