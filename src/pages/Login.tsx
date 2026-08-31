import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import styles from "../styles/auth-styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Login page. Authenticates via Firebase Auth's email/password sign-in.
 * On success, redirects to Home (rather than Profile) with a welcome
 * toast. If an already-logged-in user somehow lands here, they're
 * immediately redirected to Home too, rather than seeing the form.
 */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      toast.success(
        `Welcome back, ${userCredential.user.displayName || "there"}!`,
      );

      // Check the user's role directly here, rather than relying on
      // AuthContext's `profile` state -- that updates via a separate
      // onAuthStateChanged listener that may not have resolved yet at
      // this exact moment, so we look it up fresh to decide where to
      // send them.
      const userDocSnap = await getDoc(
        doc(db, "users", userCredential.user.uid),
      );
      const role = userDocSnap.exists() ? userDocSnap.data().role : null;

      navigate(role === "admin" ? "/manage-products" : "/");
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
