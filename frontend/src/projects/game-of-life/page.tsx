import ProjectTemplate from "@/components/ProjectTemplate";

export default function GameOfLifePage() {
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
