import { createFileRoute } from "@tanstack/react-router";
import { projectHead } from "@/utils/head";
import ProjectTemplate from "@/components/ProjectTemplate";

export const Route = createFileRoute("/projects/solitaire/")({
  head: () => projectHead("/projects/solitaire"),
  component: Solitaire,
});

function Solitaire() {
  return (
    <ProjectTemplate title="Solitaire" subtitle="A simple solitaire web app">
      <p>
        A simple solitaire web app built with React and TypeScript. It features
        a rudimentary scoring system and simple click controls.
      </p>
    </ProjectTemplate>
  );
}
