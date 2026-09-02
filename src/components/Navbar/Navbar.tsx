import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/useCart";
import { Link } from "react-router-dom";
import Logo from "../Logo";
import ThemeToggle from "../ThemeToggle";
import "./Navbar.css";

/**
 * Top navigation bar, shown on every page. Displays different links
 * depending on whether the user is logged in -- Profile/Logout when
 * they are, Register/Login when they aren't -- and shows a live count
 * badge on the cart icon reflecting the total quantity of items across
 * the cart, updating automatically as the cart changes. Also includes
 * the light/dark mode toggle.
 */
const Navbar = () => {
  const { user } = useAuth();
  const { items } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="nav-container">
      <Link className="link logo-link" to="/">
        <Logo height={76} />
      </Link>

      <div className="nav-right">
        <ThemeToggle />

        <Link className="link cart-link" to="/cart" aria-label="View cart">
          {/* Inline SVG cart icon, rather than an image file or icon
              library, so its stroke color can follow the site's CSS. */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {/* Only show the badge when there's actually something in the
              cart -- avoids displaying an empty/zero badge. */}
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>

        {user ? (
          <>
            <Link className="link" to="/profile">
              Profile
            </Link>
            <Link className="link" to="/logout">
              Logout
            </Link>
          </>
        ) : (
          <>
            <Link className="link" to="/register">
              Register
            </Link>
            <Link className="link" to="/login">
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
