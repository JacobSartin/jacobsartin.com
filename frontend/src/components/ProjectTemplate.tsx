import React from "react";
import { Link } from "@tanstack/react-router";
import Icon from "./Icon";
import {
  arrowLeftIcon,
  externalLinkIcon,
  githubIcon,
  type IconDefinition,
} from "./icons";
import "@/projects/projects.css";
import "@/projects/template.css";

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  liveUrl?: string;
  liveLabel?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  sourceIcon?: IconDefinition;
}

export default function ProjectTemplate({
  title,
  subtitle,
  children,
  liveUrl,
  liveLabel = "Open live site",
  sourceUrl: sourceUrl,
  sourceLabel: sourceLabel = "View on GitHub",
  sourceIcon = githubIcon,
}: Props) {
  return (
    <section className="container">
      <div className="header">
        <Link
          to="/projects"
          className="project-back-link"
          activeOptions={{ exact: true }}
        >
          <Icon icon={arrowLeftIcon} />
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
            <a
              className="cta-button"
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon={externalLinkIcon} />
              {liveLabel}
            </a>
          )}
          {sourceUrl && (
            <a
              className="cta-button secondary source-link"
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon icon={sourceIcon} />
              {sourceLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
