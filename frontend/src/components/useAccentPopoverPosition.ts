import { useLayoutEffect, type RefObject } from "react";

/** Keep the picker inside the visible viewport, including the mobile keyboard. */
export function useAccentPopoverPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!open || !trigger || !panel) return;

    const viewport = window.visualViewport;
    const position = () => {
      const rect = trigger.getBoundingClientRect();
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const width = Math.max(0, viewportWidth - 32);
      const top = Math.max(
        viewportTop + 16,
        Math.min(rect.bottom + 8, viewportTop + viewportHeight - 176),
      );
      const left = Math.max(
        viewportLeft + 16,
        Math.min(
          rect.right - Math.min(320, width),
          viewportLeft + width + 16 - Math.min(320, width),
        ),
      );

      panel.style.setProperty("--accent-panel-top", top + "px");
      panel.style.setProperty("--accent-panel-left", left + "px");
      panel.style.setProperty("--accent-panel-width", width + "px");
      panel.style.setProperty(
        "--accent-panel-height",
        Math.max(0, viewportTop + viewportHeight - top - 16) + "px",
      );
    };

    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, { passive: true });
    viewport?.addEventListener("resize", position);
    viewport?.addEventListener("scroll", position);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position);
      viewport?.removeEventListener("resize", position);
      viewport?.removeEventListener("scroll", position);
    };
  }, [open, panelRef, triggerRef]);
}
