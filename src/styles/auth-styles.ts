import type { CSSProperties } from "react";

/**
 * Shared inline styles for the auth-related pages (Login, Register,
 * and parts of Profile) that use React's `style` prop directly rather
 * than CSS classes. Centralizing them here keeps the look consistent
 * across all three without repeating the same style objects in each file.
 */
const styles: Record<string, CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  fieldset: {
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "5px",
    width: "300px",
    margin: "0 auto",
  },
  legend: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  input: {
    display: "block",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "100%",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
  success: {
    color: "green",
    marginBottom: "10px",
  },
  button: {
    backgroundColor: "#2f6fed",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteAccountButton: {
    backgroundColor: "red",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default styles;
