import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

/**
 * Logout page. Has no visible form or button of its own -- simply
 * signs the user out via Firebase Auth the moment this page loads
 * (triggered by the "Logout" link in the Navbar), then redirects to
 * the login page. Briefly shows "Logging out..." while that happens.
 */
const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut(auth);
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    };
    handleLogout();
  }, [navigate]);

  return <div>Logging out...</div>;
};

export default Logout;
