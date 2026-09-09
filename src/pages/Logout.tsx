import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { getAuthErrorMessage } from "../utils/firebaseErrors";

/**
 * Logout page. Has no visible form or button of its own -- simply
 * signs the user out via Firebase Auth the moment this page loads
 * (triggered by the "Logout" link in the Navbar), then redirects to
 * the login page. Briefly shows "Logging out..." while that happens.
 */
const Logout = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(true);

  useEffect(() => {
    let isActive = true;

    const handleLogout = async () => {
      try {
        await signOut(auth);
        if (!isActive) return;
        navigate("/login");
      } catch (error: unknown) {
        if (!isActive) return;
        console.error("Logout error:", error);
        setError(getAuthErrorMessage(error));
        setIsSigningOut(false);
      }
    };

    void handleLogout();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return <div>{isSigningOut ? "Logging out..." : "Logged out."}</div>;
};

export default Logout;
