import { useContext } from "react";
import { ProductContext } from "./productContextInstance";

/**
 * Custom hook for accessing the product context. Throws if used
 * outside of a ProductProvider, so misuse is caught immediately
 * during development rather than causing a silent bug.
 */
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
