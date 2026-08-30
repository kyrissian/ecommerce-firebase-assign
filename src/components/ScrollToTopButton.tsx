import { useState, useEffect } from "react";
import "./ScrollToTopButton.css";

/**
 * Floating button that appears once the user has scrolled down a bit,
 * letting them jump back to the top of the page. Fixed to the middle
 * of the left edge of the viewport. Hidden entirely near the top of
 * the page, since it'd be pointless (and visually cluttering) to show
 * a "scroll to top" button when you're already there.
 */
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the button only once scrolled down a meaningful amount --
      // 400px avoids it popping in immediately on pages that are only
      // slightly longer than the viewport.
      setIsVisible(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      className="scroll-to-top-btn"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;
