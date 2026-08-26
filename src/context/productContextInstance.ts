import { createContext } from "react";
import type { ProductAction, ProductState } from "./ProductContext";

// Define the shape of the context value. This will include the state and the dispatch function that allows components to send actions to the reducer.
export interface ProductContextType extends ProductState {
  //the dispatch function allows us to trigger actions to update the state
  dispatch: React.Dispatch<ProductAction>;
}

export const ProductContext = createContext<ProductContextType | undefined>(
  undefined,
);
