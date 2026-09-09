import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import styles from "../styles/auth-styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";
import { getAuthErrorMessage } from "../utils/firebaseErrors";

/**
 * Login page. Authenticates via Firebase Auth's email/password sign-in.
 * On success, redirects admins to Manage Products and everyone else to
 * Home, with a welcome toast. If an already-logged-in user somehow
 * lands here, they're redirected the same way.
 */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // Tracks whether the sign-in request is currently in flight, so the
  // button can disable itself and show progress -- prevents a slow
  // network from letting someone double-submit the form, and gives
  // visible feedback instead of the form appearing to do nothing.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      toast.success(
        `Welcome back, ${userCredential.user.displayName || "there"}!`,
      );

      const userDocSnap = await getDoc(
        doc(db, "users", userCredential.user.uid),
      );
      const role = userDocSnap.exists() ? userDocSnap.data().role : null;

      navigate(role === "admin" ? "/manage-products" : "/");
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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
          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default Login;
