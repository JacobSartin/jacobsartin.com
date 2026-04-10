import "./projects.css";
import "./template.css";
import ProjectCards from "./ProjectCards";
import { useEffect } from "react";
import { prefetchProjectPages } from "@/router";

export default function ProjectsPage() {
  useEffect(() => {
    void prefetchProjectPages();
  }, []);

  return (
    <section className="container" style={{ maxWidth: "1600px" }}>
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
