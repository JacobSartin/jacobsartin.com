import Icon from "@/components/Icon";
import {
  brainIcon,
  certificateIcon,
  codeIcon,
  databaseIcon,
  laptopCodeIcon,
  toolsIcon,
  type IconDefinition,
} from "@/components/icons";
import "./skills.css";

interface SkillCategory {
  icon: IconDefinition;
  title: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    icon: codeIcon,
    title: "Languages",
    skills: [
      "C++",
      "Go",
      "JavaScript / TypeScript",
      "Python",
      "Java",
      "And more...",
    ],
  },
  {
    icon: laptopCodeIcon,
    title: "Frameworks",
    skills: ["React", "Node.js", "Express"],
  },
  {
    icon: databaseIcon,
    title: "Databases",
    skills: ["PostgreSQL", "MySQL"],
  },
  {
    icon: toolsIcon,
    title: "Tools & DevOps",
    skills: ["Git / GitHub", "Docker", "Kubernetes", "CI/CD", "Linux"],
  },
  {
    icon: brainIcon,
    title: "Concepts",
    skills: [
      "REST APIs",
      "Cryptography",
      "Networking",
      "Test-Driven Development",
      "System Design",
    ],
  },
  {
    icon: certificateIcon,
    title: "Certifications",
    skills: ["Comptia Security+"],
  },
];

export default function SkillsPage() {
  return (
    <section className="container container-md">
      <div className="header">
        <h1>Technical Skills</h1>
        <div className="divider" aria-hidden="true" />
      </div>

      <div className="skills-grid">
        {skillCategories.map((category) => (
          <div key={category.title} className="content-card skill-category">
            <h2>
              <Icon icon={category.icon} />
              {category.title}
            </h2>
            <ul className="skill-list">
              {category.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
