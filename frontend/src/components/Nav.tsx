import { Link as RouterLink, useMatchRoute } from "@tanstack/react-router";
import { Link as AriaLink } from "react-aria-components";
import { lazy, Suspense } from "react";
import ThemeToggle from "./ThemeToggle";
import Icon from "./Icon";
import { githubIcon, linkedinIcon } from "./icons";

// AccentPicker pulls in culori and react-colorful; keep them out of the main chunk.
const AccentPicker = lazy(() => import("./AccentPicker"));

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
  const matchRoute = useMatchRoute();

  // TanStack marks every active link aria-current="page", so section links
  // (e.g. Projects on /projects/foo) are highlighted via inactiveProps instead
  // and announced as aria-current="true" rather than as the current page.
  const isInSection = (to: NavLink["to"]) =>
    to !== "/" && Boolean(matchRoute({ to, fuzzy: true }));

  return (
    <nav>
      <div className="nav-left">
        <RouterLink
          to="/"
          className="nav-brand"
          aria-label="Home"
          activeOptions={{ exact: true }}
        >
          <span className="nav-brand-name">jacob sartin</span>
        </RouterLink>
        <div className="nav-links">
          {navLinks.map((link) => (
            <RouterLink
              key={link.to}
              to={link.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "active" }}
              inactiveProps={
                isInSection(link.to)
                  ? { className: "active", "aria-current": "true" }
                  : undefined
              }
            >
              {link.label}
            </RouterLink>
          ))}
        </div>
      </div>
      <div className="nav-right">
        <div className="theme-controls">
          <Suspense
            fallback={<div className="accent-toggle" aria-hidden="true" />}
          >
            <AccentPicker />
          </Suspense>
          <ThemeToggle />
        </div>
        <div className="social-links">
          <AriaLink
            className="link"
            href="https://www.linkedin.com/in/jacob-sartin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon={linkedinIcon} className="linkedin-icon" />
            <span>LinkedIn</span>
          </AriaLink>
          <AriaLink
            className="link"
            href="https://github.com/JacobSartin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon={githubIcon} />
            <span>GitHub</span>
          </AriaLink>
        </div>
      </div>
    </nav>
  );
}
