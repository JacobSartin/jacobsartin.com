import { Link } from "@tanstack/react-router";
import Icon from "@/components/Icon";
import { folderOpenIcon, houseIcon } from "@/components/icons";
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
          <Link to="/" className="cta-button" activeOptions={{ exact: true }}>
            <Icon icon={houseIcon} />
            Go Home
          </Link>
          <Link to="/projects" className="cta-button secondary">
            <Icon icon={folderOpenIcon} />
            View Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
