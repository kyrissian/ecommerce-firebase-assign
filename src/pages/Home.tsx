import type { Category, Product } from "../types/types";
import ProductCard from "../components/ProductCard";
import { useProductContext } from "../context/useProductContext";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "../api/api";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./Home.css";
import ScrollToTopButton from "../components/ScrollToTopButton";

/**
 * Storefront home page. Fetches all products and categories from
 * Firestore via React Query, syncs the results into ProductContext,
 * and displays them in a searchable, sortable, filterable grid.
 *
 * Search text, category filter, and sort order all live in the URL's
 * query string (via useSearchParams), not plain useState -- that's
 * what makes the current view shareable: copying the URL and sending
 * it to someone else reproduces the exact same filtered/sorted view.
 */
const Home: React.FC = () => {
  const { products, dispatch } = useProductContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current search/sort/category values directly from the URL.
  const searchTerm = searchParams.get("search") ?? "";
  const sortOption = searchParams.get("sort") ?? "";
  const categoryFilter = searchParams.get("category") ?? "";

  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  useEffect(() => {
    if (productsData) dispatch({ type: "SET_PRODUCTS", payload: productsData });
  }, [productsData, dispatch]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  /**
   * Updates a single URL query param without disturbing the others.
   * useSearchParams' setter replaces the whole query string by
   * default, so we build off the current params rather than starting
   * fresh each time.
   */
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  // Category filtering -- now reads from the URL instead of
  // ProductContext's selectedCategory, so it's shareable like search
  // and sort.
  let filteredProducts = categoryFilter
    ? products.filter((product: Product) => product.category === categoryFilter)
    : products;

  // Search filtering -- case-insensitive match against product title.
  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product: Product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  // Sorting -- spread into a new array first since .sort() mutates
  // in place, and we don't want to mutate ProductContext's array.
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating-asc":
        return a.rating.rate - b.rating.rate;
      case "rating-desc":
        return b.rating.rate - a.rating.rate;
      default:
        return 0;
    }
  });

  return (
    <div className="home-page">
      <div className="home-controls">
        <input
          className="product-search"
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => updateParam("search", e.target.value)}
        />

        <select
          className="category-select"
          value={categoryFilter}
          onChange={(e) => updateParam("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {categories?.map((category: Category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="sort-select"
          value={sortOption}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Rating: High to Low</option>
          <option value="rating-asc">Rating: Low to High</option>
        </select>

        {(categoryFilter || searchTerm || sortOption) && (
          <button
            className="clear-filter-btn"
            onClick={() => setSearchParams({})}
          >
            Clear All Filters
          </button>
        )}
      </div>

      {isLoading && <p className="status-message">Loading...</p>}
      {error && <p className="status-message error">Error loading products</p>}
      {sortedProducts.length === 0 && !isLoading && (
        <p className="status-message">No products match your search.</p>
      )}

      <div className="product-grid">
        {sortedProducts.map((product: Product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default Home;
