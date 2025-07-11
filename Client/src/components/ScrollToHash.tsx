import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHash: React.FC = () => {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      // Handle empty hash (just "#") - scroll to top
      if (hash === "#") {
        setTimeout(() => {
          window.scrollTo({ 
            top: 0, 
            behavior: "smooth" 
          });
        }, pathname === "/" ? 100 : 300);
        return;
      }

      let attempts = 0;
      const maxAttempts = 20; // Increased for cross-route navigation
      
      const scrollToElement = () => {
        const el = document.getElementById(hash.replace("#", ""));
        console.log("Trying to scroll to:", hash, "Attempt:", attempts, "Found:", !!el);
        
        if (el) {
          // Wait a bit more to ensure layout is stable
          setTimeout(() => {
            el.scrollIntoView({ 
              behavior: "smooth", 
              block: "start",
              inline: "nearest"
            });
          }, 100);
        } else if (attempts < maxAttempts) {
          attempts++;
          // Increase delay for cross-route navigation
          const delay = attempts < 5 ? 100 : 200;
          setTimeout(scrollToElement, delay);
        }
      };

      // Add a longer initial delay for cross-route navigation
      const initialDelay = pathname === "/" ? 100 : 300;
      setTimeout(scrollToElement, initialDelay);
    }
  }, [hash, pathname]);

  return null;
};

export default ScrollToHash;
