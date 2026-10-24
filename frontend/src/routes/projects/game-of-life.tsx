import { createFileRoute } from "@tanstack/react-router";
import ProjectPage from "@/projects/game-of-life/page";
import { projectHead } from "@/utils/head";

export const Route = createFileRoute("/projects/game-of-life")({
  head: () => projectHead("/projects/game-of-life"),
  component: ProjectPage,
});
