import Icon from "@/components/Icon";
import {
  bookIcon,
  catIcon,
  codeIcon,
  footballIcon,
  gamepadIcon,
  personHikingIcon,
  type IconDefinition,
} from "@/components/icons";
import "./about.css";

interface Interest {
  icon: IconDefinition;
  label: string;
}

const interests: Interest[] = [
  { icon: codeIcon, label: "Technology" },
  { icon: bookIcon, label: "Tech Blogs" },
  { icon: gamepadIcon, label: "Gaming" },
  { icon: footballIcon, label: "Football" },
  { icon: personHikingIcon, label: "Outdoors" },
  { icon: catIcon, label: "Pets" },
];

export default function AboutPage() {
  return (
    <section className="container container-sm profile-page about-page">
      <div className="header">
        <h1>About Me</h1>
        <div className="divider" aria-hidden="true" />
      </div>

      <div className="about-content">
        <div className="content-card">
          <p>
            Hi! I&apos;m <span className="highlight">Jacob Sartin</span>, a
            software developer with a passion for building elegant and efficient
            solutions to complex problems. I consider myself a generalist, and I
            am always open to exploring new areas of technology and software
            development.
          </p>
          <p>
            I tend to gravitate towards backend development, DevOps, and more
            systems-oriented work, but I also have experience with web
            development, databases, and some basic graphics/game programming. I
            enjoy learning new technologies and programming languages, and I am
            always looking for opportunities to grow as a developer.
          </p>
          <p>
            When I&apos;m not coding, you&apos;ll find me exploring new
            technologies, reading tech blogs, or relaxing with my family and
            friends.
          </p>
        </div>

        <div className="content-card">
          <h2>Interests &amp; Hobbies</h2>
          <ul className="interests-grid">
            {interests.map((interest) => (
              <li key={interest.label}>
                <Icon icon={interest.icon} />
                {interest.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
