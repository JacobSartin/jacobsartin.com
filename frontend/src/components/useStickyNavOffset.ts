import { useLayoutEffect, type RefObject } from "react";

/** Match keyboard scrolling to the header's actual height after text reflow. */
export function useStickyNavOffset(navRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const update = () => {
      const height =
        getComputedStyle(nav).position === "sticky"
          ? nav.getBoundingClientRect().height
          : 0;
      document.documentElement.style.setProperty(
        "--sticky-nav-height",
        height + "px",
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--sticky-nav-height");
    };
  }, [navRef]);
}
