import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const themeOptions = ["light", "dark", "system"] as const;
type ThemeMode = typeof themeOptions[number];

interface ThemeToggleProps {
  variant?: "icon" | "button"; // default is "icon"
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = "icon", className = "" }) => {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  // Detect system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(mediaQuery.matches ? "dark" : "light");
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme to document & save to localStorage
  useEffect(() => {
    let appliedTheme = theme;
    if (theme === "system") appliedTheme = systemTheme;
    document.documentElement.setAttribute("data-theme", appliedTheme);
    localStorage.setItem("theme", theme);
  }, [theme, systemTheme]);

  // Load user's last choice on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemeMode | null;
    if (stored) setTheme(stored);
  }, []);

  // Theme cycle
  const handleClick = () => {
    setTheme((prev) => {
      const idx = themeOptions.indexOf(prev);
      return themeOptions[(idx + 1) % themeOptions.length];
    });
  };

  // Icon and tooltip
  let Icon, tooltip;
  if (theme === "light") {
    Icon = Moon;
    tooltip = "Switch to dark mode";
  } else if (theme === "dark") {
    Icon = Monitor;
    tooltip = "Switch to system mode";
  } else {
    Icon = Sun;
    tooltip = "Switch to light mode";
  }

  // --- Button version for mobile menu ---
  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        aria-label={tooltip}
        className={`
          w-[90%] bg-[#664147] text-white flex items-center justify-center
          px-10 py-2 rounded-full hover:bg-[#58383E] transition cursor-pointer
          font-[Nunito] text-lg font-bold
          ${className}
        `}
      >
        <Icon size={20} className="mr-2" />
        {tooltip}
      </button>
    );
  }

  // --- Icon version for main Navbar ---
  return (
    <button
      onClick={handleClick}
      aria-label={tooltip}
      title={tooltip}
      className={`
        flex items-center justify-center
        rounded-full
        bg-[#664147]
        text-white
        w-11 h-11
        hover:bg-[#58383E]
        transform transition duration-200 hover:scale-110
        cursor-pointer
        ${className}
      `}
    >
      <Icon size={20} />
    </button>
  );
};

export default ThemeToggle;