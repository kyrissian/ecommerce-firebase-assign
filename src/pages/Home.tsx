import type { Category, Product } from "../types/types";
import ProductCard from "../components/ProductCard";
import { useProductContext } from "../context/useProductContext";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "../api/api";
import { useEffect } from "react";
import "./Home.css";

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

  useEffect(() => {
    if (productsData)
      dispatch({ type: "SET_PRODUCTS", payload: productsData.data });
  }, [productsData, dispatch]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

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
          {categories?.data.map((category: Category) => (
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
