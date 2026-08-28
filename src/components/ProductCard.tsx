import type { Product } from "../types/types";
import { Rating } from "@smastrom/react-rating";
import { useCart } from "../context/useCart";
import { Link } from "react-router-dom";
import "./ProductCard.css";

/**
 * Displays a single product in the grid -- image, title, star rating,
 * price, category, and an "Add to Cart" button. Description is
 * intentionally left off here (shown only on the product's detail
 * page) to keep the grid scannable, matching how most real ecommerce
 * sites (Amazon, etc.) separate a browsing view from a detail view.
 *
 * The card itself links to /products/:id -- clicking anywhere on it
 * (except the Add to Cart button) navigates to the detail page.
 */
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { dispatch } = useCart();

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <img src={product.image} alt={product.title} className="product-image" />
      <h3 className="product-title">{product.title}</h3>

      <Rating style={{ maxWidth: 100 }} value={product.rating.rate} readOnly />

      <p className="product-price">${product.price.toFixed(2)}</p>
      <span className="product-category">{product.category.toUpperCase()}</span>

      <button
        className="add-to-cart-btn"
        onClick={(e) => {
          // Stop this click from bubbling up to the parent <Link>,
          // which would otherwise also trigger navigation to the
          // detail page -- we only want it to add to the cart here.
          e.preventDefault();
          e.stopPropagation();
          dispatch({ type: "ADD_TO_CART", payload: product });
        }}
      >
        Add to Cart
      </button>
    </Link>
  );
};

export default ProductCard;
