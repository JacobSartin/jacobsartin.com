import { useLayoutEffect, type RefObject } from "react";

/** Publish the nav's border-box height; CSS decides when an offset is needed. */
export function useStickyNavOffset(navRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const update = (height: number) => {
      document.documentElement.style.setProperty(
        "--sticky-nav-height",
        height + "px",
      );
    };
    const observer = new ResizeObserver(([entry]) => {
      const size = entry.borderBoxSize[0];
      if (size) update(size.blockSize);
    });
    observer.observe(nav, { box: "border-box" });
    update(nav.getBoundingClientRect().height);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--sticky-nav-height");
    };
  }, [navRef]);
}
