import { createFileRoute } from "@tanstack/react-router";
import { projectHead } from "@/utils/head";

export const Route = createFileRoute("/projects/game-of-life/")({
  head: () => projectHead("/projects/game-of-life"),
  component: GameOfLifePage,
});

import ProjectTemplate from "@/components/ProjectTemplate";

function GameOfLifePage() {
  return (
    <ProjectTemplate
      title="Game of Life"
      subtitle="A cellular automaton implementation"
      liveUrl="https://life.jacobsartin.com"
      sourceUrl="https://github.com/JacobSartin/GameOfLife"
    >
      <p>
        A java implementation of Conway&apos;s Game of Life that I made in high
        school. It features a simple UI and allows you to create and run
        different patterns.
      </p>
    </ProjectTemplate>
  );
}
