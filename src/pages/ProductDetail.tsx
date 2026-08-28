import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "../api/api";
import { useCart } from "../context/useCart";
import { Rating } from "@smastrom/react-rating";
import "./ProductDetail.css";

/**
 * Dedicated page for a single product, reachable at /products/:id.
 *
 * Shows the full details a product card intentionally leaves out
 * (complete description, larger image) plus its own Add to Cart button.
 * Fetches directly by id via fetchProductById rather than relying on
 * ProductContext's already-loaded list, so this page works as a real
 * standalone deep link -- someone can share or bookmark this exact URL
 * and land here without first visiting Home.
 */
const ProductDetail: React.FC = () => {
  // useParams reads the dynamic :id segment out of the current URL --
  // e.g. visiting /products/aBc123 gives us { id: "aBc123" } here.
  const { id } = useParams<{ id: string }>();
  const { dispatch } = useCart();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  if (isLoading) return <p className="status-message">Loading...</p>;
  if (error || !product) {
    return (
      <div className="product-detail-page">
        <p className="status-message error">Product not found.</p>
        <Link to="/" className="back-link">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Link to="/" className="back-link">
        ← Back to Home
      </Link>

      <div className="product-detail-content">
        <img
          src={product.image}
          alt={product.title}
          className="product-detail-image"
        />

        <div className="product-detail-info">
          <span className="product-category">
            {product.category.toUpperCase()}
          </span>
          <h1 className="product-detail-title">{product.title}</h1>
          <Rating
            style={{ maxWidth: 140 }}
            value={product.rating.rate}
            readOnly
          />
          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          <p className="product-detail-description">{product.description}</p>

          <button
            className="add-to-cart-btn"
            onClick={() => dispatch({ type: "ADD_TO_CART", payload: product })}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
