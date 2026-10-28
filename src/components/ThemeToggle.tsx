import { useEffect } from "react";
import Icon from "./Icon";
import { moonIcon, sunIcon } from "./icons";
import { safeGetStorage, safeSetStorage, StorageKey } from "@/utils/storage";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export default function ThemeToggle() {
  // The document bootstrap resolves the initial theme before first paint.
  // Listen for system preference changes (only when no explicit stored pref)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!safeGetStorage(StorageKey.Theme)) {
        const next = e.matches ? "dark" : "light";
        applyTheme(next);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = () => {
    const next: Theme =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light";
    applyTheme(next);
    safeSetStorage(StorageKey.Theme, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label="Toggle color theme"
    >
      <Icon icon={sunIcon} className="theme-icon-light" />
      <Icon icon={moonIcon} className="theme-icon-dark" />
    </button>
  );
}
