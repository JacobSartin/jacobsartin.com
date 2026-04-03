import ProjectTemplate from "@/components/ProjectTemplate";

export default function ThisSite() {
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
