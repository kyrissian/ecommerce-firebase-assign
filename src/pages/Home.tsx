import type { Category, Product } from "../types/types";
import ProductCard from "../components/ProductCard";
import { useProductContext } from "../context/useProductContext";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "../api/api";
import { useEffect } from "react";
import "./Home.css";

/**
 * Storefront home page. Fetches all products and categories from
 * Firestore via React Query, syncs the results into ProductContext
 * (so other components/pages can access the same product data without
 * re-fetching), and displays them in a filterable grid.
 */
const Home: React.FC = () => {
  const { products, selectedCategory, dispatch } = useProductContext();

  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Once React Query's fetch resolves, push the results into
  // ProductContext -- this is the only place SET_PRODUCTS gets
  // dispatched, keeping data-fetching (React Query) and shared state
  // (ProductContext) cleanly separated.
  useEffect(() => {
    if (productsData) dispatch({ type: "SET_PRODUCTS", payload: productsData });
  }, [productsData, dispatch]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Category filtering happens client-side against whatever's already
  // in ProductContext, rather than re-fetching from Firestore per category.
  const filteredProducts = selectedCategory
    ? products.filter(
        (product: Product) => product.category === selectedCategory,
      )
    : products;

  return (
    <div className="home-page">
      <div className="home-controls">
        <select
          className="category-select"
          value={selectedCategory}
          onChange={(e) =>
            dispatch({ type: "SET_SELECTED_CATEGORY", payload: e.target.value })
          }
        >
          <option value="">All Categories</option>
          {categories?.map((category: Category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>

        {selectedCategory && (
          <button
            className="clear-filter-btn"
            onClick={() =>
              dispatch({ type: "SET_SELECTED_CATEGORY", payload: "" })
            }
          >
            Clear Filter
          </button>
        )}
      </div>

      {isLoading && <p className="status-message">Loading...</p>}
      {error && <p className="status-message error">Error loading products</p>}

      <div className="product-grid">
        {filteredProducts.map((product: Product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>
  );
};

export default Home;
