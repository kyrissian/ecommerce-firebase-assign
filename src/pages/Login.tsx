import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import styles from "../styles/auth-styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Login page. Authenticates via Firebase Auth's email/password sign-in.
 * If an already-logged-in user somehow lands here (e.g. via browser
 * back button, or the ProtectedRoute redirect described below), they're
 * immediately redirected to their profile instead of seeing the form.
 */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // If someone who's already logged in lands on this page, send them
  // straight to their profile instead of showing the login form.
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div style={styles.form}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={styles.error}>{error}</p>}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Login</legend>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default Login;
