import { createFileRoute } from "@tanstack/react-router";
import ProjectsPage from "@/projects/page";
import { pageHead } from "@/utils/head";

export const Route = createFileRoute("/projects/")({
  head: () =>
    pageHead(
      "Projects",
      "A portfolio of projects showcasing various technologies and creative solutions.",
    ),
  component: ProjectsPage,
});
