import { useLayoutEffect, useRef } from "react";

const commitSha = import.meta.env.VITE_COMMIT_SHA;

export default function Footer() {
  const slotRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const footer = footerRef.current;
    if (!slot || !footer) return;

    // Reserve the measured height before taking the footer out of flow.
    // Publish the height so centered pages can reserve it within 100svh.
    const reserveHeight = () => {
      const height = footer.getBoundingClientRect().height + "px";
      slot.style.blockSize = height;
      document.body.style.setProperty("--site-footer-height", height);
    };
    reserveHeight();
    const resizeObserver = new ResizeObserver(reserveHeight);
    resizeObserver.observe(footer);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        slot.toggleAttribute("data-pinned", entry.intersectionRatio === 1);
      },
      // Scroll offsets are rounded to pixels; allow a subpixel document edge.
      { threshold: 1, rootMargin: "0px 0px 1px 0px" },
    );
    intersectionObserver.observe(slot);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      slot.removeAttribute("data-pinned");
      slot.style.removeProperty("block-size");
      document.body.style.removeProperty("--site-footer-height");
    };
  }, []);

  if (!commitSha) return null;

  return (
    <div className="site-footer-slot" ref={slotRef}>
      <footer className="site-footer" ref={footerRef}>
        <a
          href={`https://github.com/JacobSartin/jacobsartin.com/commit/${commitSha}`}
          title={commitSha}
          aria-label={`View build ${commitSha} on GitHub`}
          target="_blank"
          rel="noopener noreferrer"
        >
          build {commitSha.slice(0, 7)}
        </a>
      </footer>
    </div>
  );
}
