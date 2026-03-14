import { Link } from "@tanstack/react-router";
import "./home.css";

export default function HomePage() {
  return (
    <section className="hero">
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
          "I am a computer science student with a passion for software
          development. I enjoy a variety of programming languages and
          technologies, and I am always eager to learn new things. I have
          experience in web development, backend development, database
          management, DevOps, and some basic graphics/game programming. I am
          currently seeking opportunities to apply my skills and grow as a
          developer."
        </p>
        <div className="cta-buttons">
          <Link to="/projects" className="cta-button">
            <i className="fa-solid fa-folder-open" aria-hidden="true" />
            View Projects
          </Link>
          <Link to="/about" className="cta-button secondary">
            <i className="fa-solid fa-user" aria-hidden="true" />
            About Me
          </Link>
        </div>
      </div>
    </section>
  );
}
