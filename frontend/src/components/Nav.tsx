import { Link, useLocation } from "@tanstack/react-router";
import AccentPicker from "./AccentPicker";
import ThemeToggle from "./ThemeToggle";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  return (
    <nav>
      <div className="nav-left">
        <Link to="/" className="nav-brand" aria-label="Home" tabIndex={-1}>
          <span className="nav-brand-name">jacob sartin</span>
        </Link>
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={normalizedPath === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="nav-right">
        <div className="theme-controls">
          <AccentPicker />
          <ThemeToggle />
        </div>
        <div className="social-links">
          <a
            className="link"
            href="https://www.linkedin.com/in/jacob-sartin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-linkedin" aria-hidden="true" />
            <span>LinkedIn</span>
          </a>
          <a
            className="link"
            href="https://github.com/JacobSartin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-github" aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
