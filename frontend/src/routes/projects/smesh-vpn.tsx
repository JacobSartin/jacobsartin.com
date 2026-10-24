import { createFileRoute } from "@tanstack/react-router";
import ProjectPage from "@/projects/smesh-vpn/page";
import { projectHead } from "@/utils/head";

export const Route = createFileRoute("/projects/smesh-vpn")({
  head: () => projectHead("/projects/smesh-vpn"),
  component: ProjectPage,
});
