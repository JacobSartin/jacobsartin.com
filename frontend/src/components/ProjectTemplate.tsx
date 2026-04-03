import React from "react";
import { Link } from "@tanstack/react-router";
import { Link as AriaLink } from "react-aria-components";
import "@/projects/projects.css";

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  liveUrl?: string;
  liveLabel?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  sourceIcon?: string;
}

export default function ProjectTemplate({
  title,
  subtitle,
  children,
  liveUrl,
  liveLabel = "Open live site",
  sourceUrl: sourceUrl,
  sourceLabel: sourceLabel = "View on GitHub",
  sourceIcon: sourceIcon = "github",
}: Props) {
  return (
    <section className="container">
      <div className="header">
        <Link to="/projects" className="project-back-link">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Projects
        </Link>
        <h1>{title}</h1>
        {subtitle && <p className="subheader">{subtitle}</p>}
        <div className="divider" aria-hidden="true" />
      </div>

      <div className="content-card project-template-content">
        {children}

        <div className="project-template-actions">
          {liveUrl && (
            <AriaLink
              className="cta-button"
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i
                className="fa-solid fa-arrow-up-right-from-square"
                aria-hidden="true"
              />
              {liveLabel}
            </AriaLink>
          )}
          {sourceUrl && (
            <AriaLink
              className="cta-button secondary source-link"
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className={`fa-brands fa-${sourceIcon}`} aria-hidden="true" />
              {sourceLabel}
            </AriaLink>
          )}
        </div>
      </div>
    </section>
  );
}
