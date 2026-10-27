import type { IconDefinition } from "./icons";

interface Props {
  icon: IconDefinition;
  className?: string;
}

/** Decorative icons inherit their color; the surrounding control supplies its label. */
export default function Icon({ icon, className }: Props) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      viewBox={icon.viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.path} />
    </svg>
  );
}
