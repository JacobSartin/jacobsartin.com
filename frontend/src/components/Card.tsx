import { Link } from "@tanstack/react-router";
import "@/projects/projects.css";

export enum iconStyle {
  solid = "fa-solid",
  regular = "fa-regular",
  brand = "fa-brands",
}

export type CardData = {
  icon: string;
  iconStyle?: iconStyle; // "fa-solid" | "fa-regular"
  title: string;
  subtitle: string;
  link?: string;
  handleClick?: () => void;
};

export default function Card({
  icon,
  iconStyle,
  title,
  subtitle,
  link,
  handleClick,
}: CardData) {
  const iconClass = `${iconStyle ?? "fa-solid"} ${icon}`;

  const content = (
    <div className="card-content">
      <div className="card-image">
        <i className={iconClass} aria-hidden="true" />
      </div>
      <div className="card-info">
        <i className={iconClass} aria-hidden="true" />
        <h3>{title}</h3>
        <h4>{subtitle}</h4>
      </div>
    </div>
  );

  // If the card has a destination, render it as a link card
  if (link) {
    return (
      <Link key={title} to={link} className="card">
        {content}
      </Link>
    );
  }

  // Otherwise render a button with any action attached
  return (
    <button
      key={title}
      type="button"
      className="card"
      onClick={() => handleClick?.()}
    >
      {content}
    </button>
  );
}
