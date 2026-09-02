import { useState, useEffect } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme-preference";

/**
 * Determines the initial theme when the app first loads, in priority
 * order: 1) a previously saved manual choice in localStorage, 2) the
 * user's OS-level dark mode preference, 3) fall back to light.
 */
function getInitialTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

/**
 * Manages the app's light/dark theme state. Applies the current theme
 * to <html> via a data-theme attribute (which theme.css's
 * [data-theme="dark"] block reacts to), and persists any manual
 * choice to localStorage so it's remembered on the next visit.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
}
