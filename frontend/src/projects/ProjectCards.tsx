import Card, { CardData, iconStyle } from "@/components/Card";
import { useCallback, type MouseEvent } from "react";

// One card per project page under /projects.
export const cards: CardData[] = [
  {
    title: "This Site",
    subtitle: "About this website",
    icon: "fa-file",
    iconStyle: iconStyle.solid,
    link: "/projects/this-site",
  },
  {
    title: "Smesh VPN",
    subtitle: "Mesh VPN experiment",
    icon: "fa-network-wired",
    iconStyle: iconStyle.solid,
    link: "/projects/smesh-vpn",
  },
  {
    title: "Cluster",
    subtitle: "Distributed tooling",
    icon: "fa-kubernetes",
    iconStyle: iconStyle.brand,
    link: "/projects/cluster",
  },
  {
    title: "Game of Life",
    subtitle: "A cellular automaton implementation",
    icon: "fa-table-cells-large",
    iconStyle: iconStyle.solid,
    link: "/projects/game-of-life",
  },
  {
    title: "Solitaire",
    subtitle: "A simple solitaire web app",
    icon: "fa-diamond",
    iconStyle: iconStyle.solid,
    link: "/projects/solitaire",
  },
];

export default function ProjectCards() {
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const cardElements = container.querySelectorAll<HTMLElement>(".card");

    cardElements.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  }, []);

  return (
    <div id="cards" onMouseMove={handleMouseMove}>
      {cards.map((card) => (
        <Card key={card.title} {...card} />
      ))}
    </div>
  );
}
