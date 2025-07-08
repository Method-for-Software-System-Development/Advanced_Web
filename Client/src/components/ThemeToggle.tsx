import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

// Available theme modes that can be selected
const themeOptions = ["light", "dark", "system"] as const;
type ThemeMode = (typeof themeOptions)[number];

/**
 * Props for the ThemeToggle component
 */
interface ThemeToggleProps {
  /** Display variant: "icon" for navbar or "button" for mobile menu */
  variant?: "icon" | "button";
  /** Additional CSS classes for styling customization */
  className?: string;
}

/**
 * Utility function to get initial theme from localStorage or default to system preference
 */
function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as ThemeMode) || "system";
}

/**
 * Theme toggle component that allows users to switch between light, dark, and system themes.
 * Supports two display variants: icon for navbar and button for mobile menu.
 * Automatically syncs with system preferences and persists user choice in localStorage.
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "icon",
  className = "",
}) => {
  // User's selected theme preference
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  // Current system theme preference
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  // Monitor system theme preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemTheme(mq.matches ? "dark" : "light");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Apply the effective theme to the document and persist user choice
  useEffect(() => {
    const root = document.documentElement;
    const effective = theme === "system" ? systemTheme : theme;
    root.classList.toggle("dark", effective === "dark");

    // Store user preference or remove if using system default
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  }, [theme, systemTheme]);

  // Sync theme changes across browser tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") {
        setTheme((e.newValue as ThemeMode) || "system");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Cycle through available theme modes
  const handleClick = () =>
    setTheme((prev) => {
      const i = themeOptions.indexOf(prev);
      return themeOptions[(i + 1) % themeOptions.length];
    });

  // Determine icon and tooltip based on current theme
  const { Icon, tooltip }: { Icon: React.ElementType; tooltip: string } =
    theme === "light"
      ? { Icon: Moon, tooltip: "Switch to dark mode" }
      : theme === "dark"
        ? { Icon: Monitor, tooltip: "Switch to system mode" }
        : { Icon: Sun, tooltip: "Switch to light mode" };

  // Render full-width button variant for mobile menu
  if (variant === "button")
    return (
      <button
        onClick={handleClick}
        aria-label={tooltip}
        className={`
          w-[90%] bg-wine dark:bg-white text-white dark:text-wine flex items-center justify-center
          px-10 py-2 rounded-full hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200
          font-[Nunito] text-lg font-bold cursor-pointer
          ${className}
        `}
      >
        <Icon size={20} className="mr-2" />
        {tooltip}
      </button>
    );

  // Render circular icon variant for navbar
  return (
    <button
      onClick={handleClick}
      aria-label={tooltip}
      title={tooltip}
      className={`
        flex items-center justify-center rounded-full
        bg-wine dark:bg-white text-white dark:text-wine w-11 h-11
        hover:bg-wineDark dark:hover:bg-whiteDark transform transition duration-200 hover:scale-110
        cursor-pointer
        ${className}
      `}
    >
      <Icon size={20} />
    </button>
  );
};

export default ThemeToggle;