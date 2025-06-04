import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const themeOptions = ["light", "dark", "system"] as const;
type ThemeMode = (typeof themeOptions)[number];

interface ThemeToggleProps {
  /** “icon” (navbar) or full-width “button” (mobile drawer) */
  variant?: "icon" | "button";
  /** Tailwind utility overrides */
  className?: string;
}

/**
 * Utility: Returns initial theme value from localStorage or defaults to "system".
 */
function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as ThemeMode) || "system";
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "icon",
  className = "",
}) => {
  // State: user-chosen theme or “system”
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  // State: real-time OS preference
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  // Watch OS setting
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemTheme(mq.matches ? "dark" : "light");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Apply effective theme + persist user choice
  useEffect(() => {
    const root = document.documentElement;
    const effective = theme === "system" ? systemTheme : theme;
    root.classList.toggle("dark", effective === "dark");

    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  }, [theme, systemTheme]);

  // Sync across browser tabs/windows (optional)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") {
        setTheme((e.newValue as ThemeMode) || "system");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Cycle through modes
  const handleClick = () =>
    setTheme((prev) => {
      const i = themeOptions.indexOf(prev);
      return themeOptions[(i + 1) % themeOptions.length];
    });

  // Select icon + tooltip
  const { Icon, tooltip }: { Icon: React.ElementType; tooltip: string } =
    theme === "light"
      ? { Icon: Moon, tooltip: "Switch to dark mode" }
      : theme === "dark"
      ? { Icon: Monitor, tooltip: "Switch to system mode" }
      : { Icon: Sun, tooltip: "Switch to light mode" };

  // Full-width button (mobile)
  if (variant === "button")
    return (
      <button
        onClick={handleClick}
        aria-label={tooltip}
        className={`
          w-[90%] bg-[#664147] text-white flex items-center justify-center
          px-10 py-2 rounded-full hover:bg-[#58383E] transition
          font-[Nunito] text-lg font-bold cursor-pointer
          ${className}
        `}
      >
        <Icon size={20} className="mr-2" />
        {tooltip}
      </button>
    );

  // Circular icon (navbar)
  return (
    <button
      onClick={handleClick}
      aria-label={tooltip}
      title={tooltip}
      className={`
        flex items-center justify-center rounded-full
        bg-[#664147] text-white w-11 h-11
        hover:bg-[#58383E] transform transition duration-200 hover:scale-110
        cursor-pointer ${className}
      `}
    >
      <Icon size={20} />
    </button>
  );
};

export default ThemeToggle;