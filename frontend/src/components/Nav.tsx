import { Link as RouterLink, useLocation } from "@tanstack/react-router";
import { Link as AriaLink } from "react-aria-components";
import AccentPicker from "./AccentPicker";
import ThemeToggle from "./ThemeToggle";

interface NavLink {
  to: "/" | "/projects" | "/skills" | "/about";
  label: string;
}

const navLinks: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/skills", label: "Skills" },
  { to: "/about", label: "About" },
];

export default function Nav() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  return (
    <nav>
      <div className="nav-left">
        <RouterLink to="/" className="nav-brand" aria-label="Home">
          <span className="nav-brand-name">jacob sartin</span>
        </RouterLink>
        <div className="nav-links">
          {navLinks.map((link) => (
            <RouterLink
              key={link.to}
              to={link.to}
              className={normalizedPath === link.to ? "active" : ""}
            >
              {link.label}
            </RouterLink>
          ))}
        </div>
      </div>
      <div className="nav-right">
        <div className="theme-controls">
          <AccentPicker />
          <ThemeToggle />
        </div>
        <div className="social-links">
          <AriaLink
            className="link"
            href="https://www.linkedin.com/in/jacob-sartin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-linkedin" aria-hidden="true" />
            <span>LinkedIn</span>
          </AriaLink>
          <AriaLink
            className="link"
            href="https://github.com/JacobSartin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-github" aria-hidden="true" />
            <span>GitHub</span>
          </AriaLink>
        </div>
      </div>
    </nav>
  );
}
