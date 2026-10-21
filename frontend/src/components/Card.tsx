import { createLink } from "@tanstack/react-router";
import { Button, Link as AriaLink } from "react-aria-components";
import Icon from "./Icon";
import type { IconDefinition } from "./icons";
import "@/projects/projects.css";

type InternalProjectRoute = "/projects" | `/projects/${string}`;
type ExternalProjectLink = `http://${string}` | `https://${string}`;
type ProjectLink = InternalProjectRoute | ExternalProjectLink;

function isExternalProjectLink(link: ProjectLink): link is ExternalProjectLink {
  return link.startsWith("http://") || link.startsWith("https://");
}

const RouterAriaLink = createLink(AriaLink);

export type CardData = {
  icon: IconDefinition;
  title: string;
  subtitle: string;
  link?: ProjectLink;
  handleClick?: () => void;
};

export default function Card({
  icon,
  title,
  subtitle,
  link,
  handleClick,
}: CardData) {
  const content = (
    <div className="card-content">
      <div className="card-image">
        <Icon icon={icon} />
      </div>
      <div className="card-info">
        <Icon icon={icon} />
        <h3>{title}</h3>
        <h4>{subtitle}</h4>
      </div>
    </div>
  );

  // If the card has a destination, render it as a link card
  if (link) {
    if (isExternalProjectLink(link)) {
      return (
        <AriaLink
          key={title}
          href={link}
          className="card"
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </AriaLink>
      );
    }

    return (
      <RouterAriaLink key={title} to={link as never} className="card">
        {content}
      </RouterAriaLink>
    );
  }

  // Otherwise render a button with any action attached
  return (
    <Button
      key={title}
      type="button"
      className="card"
      onPress={() => handleClick?.()}
    >
      {content}
    </Button>
  );
}
