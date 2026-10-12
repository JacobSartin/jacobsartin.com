import { Link } from "@tanstack/react-router";
import "./not-found.css";

export default function NotFound() {
  return (
    <section className="not-found grid-backdrop">
      <div className="not-found-inner">
        <span className="not-found-prompt" aria-hidden="true">
          <span className="prompt-char">$</span> cd /page
        </span>
        <h1 className="not-found-code">404</h1>
        <p className="not-found-message">
          Page not found. The path you followed doesn&apos;t exist.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="cta-button">
            <i className="fa-solid fa-house" aria-hidden="true" />
            Go Home
          </Link>
          <Link to="/projects" className="cta-button secondary">
            <i className="fa-solid fa-folder-open" aria-hidden="true" />
            View Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
