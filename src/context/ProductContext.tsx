import { type ReactNode, useReducer } from "react";
import type { Product } from "../types/types";
import { ProductContext } from "./productContextInstance";

/**
 * Action types for the product reducer. SET_PRODUCTS replaces the full
 * product list (used after fetching from Firestore via React Query in
 * Home.tsx).
 *
 * Note: category filtering used to live here too (SET_SELECTED_CATEGORY),
 * but was migrated to the URL via useSearchParams so filtered views are
 * shareable via link -- see Home.tsx.
 */
export type ProductAction = { type: "SET_PRODUCTS"; payload: Product[] };

export interface ProductState {
  products: Product[];
}

const initialState: ProductState = {
  products: [],
};

const productReducer = (
  state: ProductState,
  action: ProductAction,
): ProductState => {
  switch (action.type) {
    case "SET_PRODUCTS":
      return {
        ...state,
        products: action.payload,
      };
    default:
      throw new Error(
        `Unhandled action type: ${(action as ProductAction).type}`,
      );
  }
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  return (
    <ProductContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};
