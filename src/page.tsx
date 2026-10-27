import { Link } from "@tanstack/react-router";
import Icon from "@/components/Icon";
import { folderOpenIcon, userIcon } from "@/components/icons";
import "./home.css";

export default function HomePage() {
  return (
    <section className="hero grid-backdrop">
      <div className="hero-inner">
        <span className="hero-prompt" aria-hidden="true">
          <span className="prompt-char">$</span> whoami
        </span>
        <h1 className="hero-name">Jacob Sartin</h1>
        <h2 className="hero-role">
          Software Developer
          <span className="cursor" aria-hidden="true" />
        </h2>
        <p className="hero-description">
          I&apos;m a software developer with a B.S. in computer science from
          Bradley University (2026). I&apos;ve built web apps, backend services
          and infrastructure tooling in TypeScript, Go, C++ and Python, and I
          run my own Kubernetes homelab. I&apos;m looking for my first full-time
          role in software or infrastructure engineering.
        </p>
        <div className="cta-buttons">
          <Link to="/projects" className="cta-button">
            <Icon icon={folderOpenIcon} />
            View Projects
          </Link>
          <Link to="/about" className="cta-button secondary">
            <Icon icon={userIcon} />
            About Me
          </Link>
        </div>
      </div>
    </section>
  );
}
