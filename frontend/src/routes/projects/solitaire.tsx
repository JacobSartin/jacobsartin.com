import { createFileRoute } from "@tanstack/react-router";
import ProjectPage from "@/projects/solitaire/page";
import { projectHead } from "@/utils/head";

export const Route = createFileRoute("/projects/solitaire")({
  head: () => projectHead("/projects/solitaire"),
  component: ProjectPage,
});
