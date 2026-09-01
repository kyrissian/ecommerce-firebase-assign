import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import styles from "../styles/auth-styles";
import { useNavigate } from "react-router-dom";

/**
 * Registration page.
 *
 * Handles two separate but linked pieces of work when a new user signs up:
 * 1. Creates the actual login credentials via Firebase Authentication.
 * 2. Creates a matching profile document in Firestore's "users" collection,
 *    using the same uid Auth assigned, so the two records stay linked.
 *
 * If step 2 fails after step 1 already succeeded (a genuine edge case --
 * network drop, Firestore hiccup, etc.), the person ends up with a real
 * login but no Firestore profile. We surface a specific error message
 * for that case rather than the generic fallback, since it's a
 * meaningfully different failure than a bad password or duplicate email.
 */
const Register = () => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
      return;
    }

    try {
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: displayName,
        email: email,
        role: "customer",
      });

      navigate("/profile");
    } catch (error: unknown) {
      // Auth account was created successfully, but something after that
      // failed (profile update or the Firestore document write).
      console.error("Post-registration setup failed:", error);
      setError(
        "Your account was created, but we couldn't finish setting up your " +
          "profile. Please try logging in, or contact support if this keeps happening.",
      );
    }
  };

  return (
    <div style={styles.form}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={styles.error}>{error}</p>}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Register</legend>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="text"
            placeholder="Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" style={styles.button}>
            Register
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default Register;
