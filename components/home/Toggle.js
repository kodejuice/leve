import { useEffect, useState } from "react";
import { parseCookies, setCookie } from "nookies";
import { setTheme } from "../../utils";

export default function Toggle({ onSwitch }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const darkVal = parseCookies(null).__dark === "1";
    setIsDark(darkVal);
  }, []);

  const handleToggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    setCookie(null, "__dark", nextDark ? 1 : 0, {
      path: "/",
      maxAge: 86400 * 365,
    });

    setTheme(nextDark ? 1 : 0);

    if (onSwitch) {
      setTimeout(onSwitch, 50);
    }
  };

  if (!mounted) {
    return <div className="theme-toggle-placeholder" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="theme-toggle-btn"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        // Sun icon (soft golden glow in dark mode)
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="theme-icon sun-icon"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        // Crescent moon icon (quiet obsidian in light mode)
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="theme-icon moon-icon"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
