// Apply persisted appearance before first paint; recover stale chunks once.
export const bootstrapScript = String.raw`(function () {
        try {
          var t;
          var accent;
          try {
            t = localStorage.getItem("theme");
            accent = localStorage.getItem("accent");
          } catch (e) {}
          if (t !== "light" && t !== "dark") {
            t = matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light";
          }
          document.documentElement.setAttribute("data-theme", t);

          if (
            typeof accent === "string" &&
            /^oklch\(\s*-?\d*\.?\d+\s+-?\d*\.?\d+\s+-?\d*\.?\d+\s*\)$/i.test(
              accent,
            )
          ) {
            document.documentElement.style.setProperty("--accent", accent);
          }
        } catch (e) {}
      })();
// A deploy replaces the previous build's chunks, so a page opened before it
      // reloads once to pick up the new build instead of failing to load a page.
      // The page stays put when a reload cannot help (offline), cannot be
      // limited to one (no session storage), or the chunk is optional.
      window.addEventListener("vite:preloadError", function (event) {
        if (window.__optionalChunkLoads > 0 || navigator.onLine === false) {
          return;
        }
        try {
          var last = Number(sessionStorage.getItem("preload-reload")) || 0;
          if (Date.now() - last < 10000) return;
          sessionStorage.setItem("preload-reload", String(Date.now()));
        } catch (e) {
          return;
        }
        event.preventDefault();
        location.reload();
      });`;

/**
 * Load a chunk whose caller reports its own failure. The document bootstrap
 * leaves the page alone while one of these is in flight.
 */
export function loadOptionalChunk<T>(load: () => Promise<T>): Promise<T> {
  window.__optionalChunkLoads = (window.__optionalChunkLoads ?? 0) + 1;
  return load().finally(() => {
    window.__optionalChunkLoads = (window.__optionalChunkLoads ?? 1) - 1;
  });
}
