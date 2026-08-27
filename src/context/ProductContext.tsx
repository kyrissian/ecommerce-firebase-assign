import { type ReactNode, useReducer } from "react";
import type { Product } from "../types/types";
import { ProductContext } from "./productContextInstance";

/**
 * Action types for the product reducer. An action is an instruction to
 * change state -- SET_PRODUCTS replaces the full product list (used
 * after fetching from Firestore via React Query in Home.tsx), and
 * SET_SELECTED_CATEGORY updates which category filter is active.
 */
export type ProductAction =
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_SELECTED_CATEGORY"; payload: string };

/** Shape of the product context's state: the full product list plus
 * which category (if any) is currently selected for filtering. */
export interface ProductState {
  products: Product[];
  selectedCategory: string;
}

const initialState: ProductState = {
  products: [],
  selectedCategory: "",
};

/**
 * Reducer that listens for actions and returns a new state based on
 * the action type. Takes the current state and an action as arguments,
 * always returning a brand-new state object rather than mutating the
 * existing one.
 */
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
    case "SET_SELECTED_CATEGORY":
      return {
        ...state,
        selectedCategory: action.payload,
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

/**
 * Provides product state (the list itself, plus category filtering)
 * to the whole app. Notably does NOT fetch data itself -- that's done
 * via React Query in Home.tsx, which dispatches SET_PRODUCTS once the
 * fetch completes. This context is purely for holding and sharing that
 * state afterward.
 */
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
