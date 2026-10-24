import { createFileRoute } from "@tanstack/react-router";
import ProjectPage from "@/projects/cluster/page";
import { projectHead } from "@/utils/head";

export const Route = createFileRoute("/projects/cluster")({
  head: () => projectHead("/projects/cluster"),
  component: ProjectPage,
});
