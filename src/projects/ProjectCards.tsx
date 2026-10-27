import Card from "@/components/Card";
import { useEffect, useRef } from "react";
import { cards } from "./cards";

export default function ProjectCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const hoverEffects = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let frame: number | null = null;
    let clientX = 0;
    let clientY = 0;

    const cancelFrame = () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!hoverEffects.matches) return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (frame !== null) return;

      frame = window.requestAnimationFrame(() => {
        frame = null;
        if (!hoverEffects.matches) return;

        // Read every position before writing styles, once per animation frame.
        const positions = Array.from(
          container.querySelectorAll<HTMLElement>(".card"),
          (card) => ({ card, rect: card.getBoundingClientRect() }),
        );

        for (const { card, rect } of positions) {
          card.style.setProperty("--mouse-x", `${clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${clientY - rect.top}px`);
        }
      });
    };

    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", cancelFrame);
    hoverEffects.addEventListener("change", cancelFrame);

    return () => {
      cancelFrame();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", cancelFrame);
      hoverEffects.removeEventListener("change", cancelFrame);
    };
  }, []);

  return (
    <div id="cards" ref={containerRef}>
      {cards.map((card) => (
        <Card key={card.title} {...card} />
      ))}
    </div>
  );
}
