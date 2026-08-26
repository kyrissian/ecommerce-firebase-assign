import { type ReactNode, useReducer } from "react";
import type { Product } from "../types/types";
import { ProductContext } from "./productContextInstance";

//define action types. an action is an instruction to change a state
export type ProductAction =
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_SELECTED_CATEGORY"; payload: string };

//Structure of our state. It will hold the products and the selected category
export interface ProductState {
  products: Product[];
  selectedCategory: string;
}

//Initial state for the product context
const initialState: ProductState = {
  products: [],
  selectedCategory: "",
};

// Reducer function to listen for actions and changes the state based on the action type and returns the new state. It takes the current state and an action as arguments and returns a new state based on the action type.
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

// Provider component
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
