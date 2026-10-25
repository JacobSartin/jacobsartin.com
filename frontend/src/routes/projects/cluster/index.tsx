import { createFileRoute } from "@tanstack/react-router";
import { projectHead } from "@/utils/head";

export const Route = createFileRoute("/projects/cluster/")({
  head: () => projectHead("/projects/cluster"),
  component: ClusterPage,
});

import ProjectTemplate from "@/components/ProjectTemplate";

function ClusterPage() {
  return (
    <ProjectTemplate title="Cluster" subtitle="Distributed tooling">
      <p>
        Self hosted kubernetes cluster using talos linux. It is managed through
        fluxcd and gitops. I use it to run various services including a vpn,
        developer tools, this website, authelia OAUTH, and more. I also use it
        to learn about kubernetes and distributed systems in general. While
        sensitive values are encrypted with sops, I still keep the cluster
        private for extra security and privacy.
      </p>
    </ProjectTemplate>
  );
}
