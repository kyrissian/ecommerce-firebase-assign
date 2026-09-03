import { useAuth } from "../../context/useAuth";
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
 *
 * Cart + auth links are grouped in their own wrapper (.nav-links-group)
 * separate from the theme toggle, so on narrow screens the toggle can
 * sit on the left of its row while the rest stay grouped on the right
 * -- see the mobile media query in Navbar.css.
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

        <div className="nav-links-group">
          <Link className="link cart-link" to="/cart" aria-label="View cart">
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
    </div>
  );
};

export default Navbar;
