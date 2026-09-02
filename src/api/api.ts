import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import type { CartItem, Order, Product } from "../types/types";
import { calculateTotalPrice } from "../utils/calculations";

export const fetchProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, "products"));
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Product[];
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  const productRef = doc(db, "products", id);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    return null;
  }

  return { id: productSnap.id, ...productSnap.data() } as Product;
};

export const fetchCategories = async (): Promise<string[]> => {
  const products = await fetchProducts();
  const uniqueCategories = new Set(products.map((product) => product.category));
  return Array.from(uniqueCategories);
};

export const createProduct = async (
  product: Omit<Product, "id">,
): Promise<void> => {
  await addDoc(collection(db, "products"), product);
};

export const updateProduct = async (
  id: string,
  updates: Partial<Omit<Product, "id">>,
): Promise<void> => {
  const productRef = doc(db, "products", id);
  await updateDoc(productRef, updates);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const productRef = doc(db, "products", id);
  await deleteDoc(productRef);
};

/**
 * Saves a completed order to Firestore's "orders" collection. Uses the
 * shared calculateTotalPrice helper (utils/calculations.ts) rather than
 * repeating the reduce logic here, keeping it in sync with the same
 * calculation used in Cart and Checkout.
 */
export const createOrder = async (
  userId: string,
  items: CartItem[],
  recipientName: string,
  shippingAddress: string,
): Promise<string> => {
  const totalPrice = calculateTotalPrice(items);

  const orderRef = await addDoc(collection(db, "orders"), {
    userId,
    items,
    totalPrice,
    recipientName,
    shippingAddress,
    createdAt: new Date().toISOString(),
  });

  return orderRef.id;
};

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
