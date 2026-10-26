import "./projects.css";
import ProjectCards from "./ProjectCards";

export default function ProjectsPage() {
  return (
    <section className="container container-md">
      <div className="header">
        <h1>Projects</h1>
        <div className="divider" aria-hidden="true" />
        <p className="subheader">
          A portfolio of projects showcasing various technologies and creative
          solutions. Click any card to explore.
        </p>
      </div>
      <ProjectCards />
    </section>
  );
}
