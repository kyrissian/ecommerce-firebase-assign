import { createProduct } from "../api/api";
import type { Product } from "../types/types";

/**
 * One-time migration script: fetches all products from FakeStoreAPI
 * and writes each one into Firestore's "products" collection via
 * createProduct(). Meant to be run once, manually, to seed real product
 * data into Firestore -- not part of the app's normal operation.
 */
export const seedProducts = async (): Promise<void> => {
  const response = await fetch("https://fakestoreapi.com/products");
  const products: Product[] = await response.json();

  for (const product of products) {
    // Strip out the old numeric `id` -- Firestore will generate its own
    // string id for each document when createProduct() runs.
    const { id, ...productWithoutId } = product;
    await createProduct(productWithoutId);
  }

  console.log(`Seeded ${products.length} products into Firestore.`);
};
