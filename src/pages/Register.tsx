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
 * Every new registration is given the "customer" role by default -- there's
 * no way to self-register as an admin through this form. Admin accounts are
 * promoted manually via the Firebase console.
 */
const Register = () => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      // Step 1: Create the user's login credentials with Firebase Auth.
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Step 2: Set the displayName on the Auth user object itself, so
      // things like auth.currentUser.displayName work elsewhere in the app.
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // Step 3: Create the corresponding Firestore user document. We use
      // setDoc (not addDoc) because we want to choose the document's ID
      // ourselves -- specifically, the same uid Firebase Auth just
      // generated -- rather than letting Firestore assign a random one.
      // This keeps each user's Auth account and Firestore profile linked
      // by a shared, predictable ID.
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: displayName,
        email: email,
        role: "customer",
      });

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
