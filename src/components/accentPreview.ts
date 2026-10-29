function applyAccent(accent: string) {
  const style = document.documentElement.style;
  if (style.getPropertyValue("--accent") !== accent) {
    style.setProperty("--accent", accent);
  }
}

/** Own the page preview and its frames independently of picker renders. */
export function createAccentPreview() {
  let frame: number | null = null;
  let releaseFrame: number | null = null;
  let pending: string | null = null;
  let saved: string | null = null;

  const cancelFrames = () => {
    if (frame !== null) window.cancelAnimationFrame(frame);
    if (releaseFrame !== null) window.cancelAnimationFrame(releaseFrame);
    frame = releaseFrame = null;
    pending = null;
  };

  return {
    begin(accent: string) {
      cancelFrames();
      saved = accent;
      const root = document.documentElement;
      root.setAttribute("data-accent-preview", "");
    },
    preview(accent: string) {
      if (saved === null) return;
      pending = accent;
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        if (pending !== null) applyAccent(pending);
        pending = null;
      });
    },
    commit(accent: string) {
      cancelFrames();
      saved = null;
      applyAccent(accent);
      const root = document.documentElement;
      if (!root.hasAttribute("data-accent-preview")) return;
      // Paint the final/reverted color before restoring hover transitions.
      releaseFrame = window.requestAnimationFrame(() => {
        releaseFrame = window.requestAnimationFrame(() => {
          releaseFrame = null;
          root.removeAttribute("data-accent-preview");
        });
      });
    },
    dispose() {
      cancelFrames();
      if (saved !== null) applyAccent(saved);
      saved = null;
      const root = document.documentElement;
      root.removeAttribute("data-accent-preview");
    },
  };
}
