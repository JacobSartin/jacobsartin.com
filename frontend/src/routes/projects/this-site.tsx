import { createFileRoute } from "@tanstack/react-router";
import ProjectPage from "@/projects/this-site/page";
import { projectHead } from "@/utils/head";

export const Route = createFileRoute("/projects/this-site")({
  head: () => projectHead("/projects/this-site"),
  component: ProjectPage,
});
