import type { Product } from "../types/types";
import { Rating } from "@smastrom/react-rating";
import { useCart } from "../context/useCart";
import "./ProductCard.css";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { dispatch } = useCart();

  return (
    <div className="product-card">
      <img src={product.image} alt={product.title} className="product-image" />
      <h3 className="product-title">{product.title}</h3>
      <Rating style={{ maxWidth: 100 }} value={product.rating.rate} readOnly />
      <p className="product-price">${product.price}</p>
      <span className="product-category">{product.category.toUpperCase()}</span>
      <p className="product-description">{product.description}</p>
      <button
        className="add-to-cart-btn"
        onClick={() => dispatch({ type: "ADD_TO_CART", payload: product })}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
