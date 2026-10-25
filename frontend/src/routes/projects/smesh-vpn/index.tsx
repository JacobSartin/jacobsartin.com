import { createFileRoute } from "@tanstack/react-router";
import { projectHead } from "@/utils/head";

export const Route = createFileRoute("/projects/smesh-vpn/")({
  head: () => projectHead("/projects/smesh-vpn"),
  component: SmeshVpnPage,
});

import ProjectTemplate from "@/components/ProjectTemplate";

function SmeshVpnPage() {
  return (
    <ProjectTemplate
      title="Smesh VPN"
      subtitle="Mesh VPN experiment"
      sourceUrl="https://github.com/JacobSartin/SMESH-VPN"
    >
      <p>
        Experimentation with peer-to-peer mesh VPNs, focusing on sound
        cryptography and secure key exchange with seamless node connectivity.
        The project does not use any protocol to allow me to explore the
        concept. It is implemented in go and uses the built in crypto libraries
        for key exchange and encryption.
      </p>
    </ProjectTemplate>
  );
}
