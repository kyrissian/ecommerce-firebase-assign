import { createContext } from "react";
import type { ProductAction, ProductState } from "./ProductContext";

/**
 * Shape of the context value exposed to any component calling
 * useProductContext() -- extends ProductState (products, selectedCategory)
 * and adds the dispatch function, so components can both read state and
 * trigger actions to update it.
 */
export interface ProductContextType extends ProductState {
  dispatch: React.Dispatch<ProductAction>;
}

/**
 * Split into its own file (separate from ProductContext.tsx, which holds
 * the actual ProductProvider component) so useProductContext.ts can
 * import just the context object without pulling in the whole provider --
 * keeps Fast Refresh happy, since files mixing components and
 * non-component exports can cause dev-mode reload warnings.
 */
export const ProductContext = createContext<ProductContextType | undefined>(
  undefined,
);
