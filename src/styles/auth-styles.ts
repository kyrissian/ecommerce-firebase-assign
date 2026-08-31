import type { CSSProperties } from "react";

/**
 * Shared inline styles for the auth-related pages (Login, Register,
 * and parts of Profile) that use React's `style` prop directly rather
 * than CSS classes.
 */
const styles: Record<string, CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "60px",
  },
  fieldset: {
    border: "1px solid var(--color-primary-light)",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    margin: "0 auto",
    backgroundColor: "var(--color-surface)",
  },
  legend: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "var(--color-text)",
  },
  input: {
    display: "block",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid var(--color-primary-light)",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text)",
    width: "100%",
    boxSizing: "border-box",
  },
  error: {
    color: "var(--color-error)",
    marginBottom: "10px",
  },
  success: {
    color: "var(--color-success)",
    marginBottom: "10px",
  },
  button: {
    backgroundColor: "var(--color-primary)",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  deleteAccountButton: {
    backgroundColor: "var(--color-error)",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default styles;
