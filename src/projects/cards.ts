import type { CardData } from "@/components/Card";
import {
  diamondIcon,
  fileIcon,
  kubernetesIcon,
  networkWiredIcon,
  tableCellsIcon,
} from "@/components/icons";

// One card per project page under /projects.
export const cards: CardData[] = [
  {
    title: "This Site",
    subtitle: "About this website",
    icon: fileIcon,
    link: "/projects/this-site",
  },
  {
    title: "Smesh VPN",
    subtitle: "Mesh VPN experiment",
    icon: networkWiredIcon,
    link: "/projects/smesh-vpn",
  },
  {
    title: "Cluster",
    subtitle: "Distributed tooling",
    icon: kubernetesIcon,
    link: "/projects/cluster",
  },
  {
    title: "Game of Life",
    subtitle: "A cellular automaton implementation",
    icon: tableCellsIcon,
    link: "/projects/game-of-life",
  },
  {
    title: "Solitaire",
    subtitle: "A simple solitaire web app",
    icon: diamondIcon,
    link: "/projects/solitaire",
  },
];
