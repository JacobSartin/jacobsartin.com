import { createFileRoute } from "@tanstack/react-router";
import { projectHead } from "@/utils/head";

export const Route = createFileRoute("/projects/this-site/")({
  head: () => projectHead("/projects/this-site"),
  component: ThisSite,
});

import ProjectTemplate from "@/components/ProjectTemplate";

function ThisSite() {
  return (
    <ProjectTemplate
      title="This Site"
      subtitle="this website"
      sourceUrl="https://github.com/JacobSartin/jacobsartin.com"
    >
      <p>
        Notes about this site, build process, and the small utilities used to
        generate and serve content.
      </p>
    </ProjectTemplate>
  );
}
