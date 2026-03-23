import { useCallback, useEffect, useState } from "react";
import { safeGetStorage, safeSetStorage } from "@/utils/storage";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // On mount: read stored preference or fall back to system preference
  useEffect(() => {
    const stored = safeGetStorage(THEME_STORAGE_KEY) as Theme | null;
    const resolved =
      stored === "light" || stored === "dark" ? stored : getSystemTheme();

    setTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  // Listen for system preference changes (only when no explicit stored pref)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!safeGetStorage(THEME_STORAGE_KEY)) {
        const next = e.matches ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      safeSetStorage(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  if (!mounted) {
    return <div className="theme-toggle" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <i
        className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`}
        aria-hidden="true"
      />
    </button>
  );
}
