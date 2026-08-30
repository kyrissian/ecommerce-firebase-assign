import { Link } from "react-router-dom";
import "./NotFound.css";

/**
 * Catch-all page shown when someone visits a URL that doesn't match
 * any defined route. Registered in App.tsx as the last <Route>, using
 * path="*" so React Router falls back to it for anything unmatched.
 */
const NotFound: React.FC = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>We couldn't find the page you're looking for.</p>
      <Link to="/" className="not-found-link">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
