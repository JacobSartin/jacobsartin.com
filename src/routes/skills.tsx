import { createFileRoute } from "@tanstack/react-router";
import SkillsPage from "@/skills/page";
import { pageHead } from "@/utils/head";

export const Route = createFileRoute("/skills")({
  head: () =>
    pageHead(
      "Skills",
      "Languages, frameworks, databases, tools, and certifications Jacob Sartin works with.",
    ),
  component: SkillsPage,
});
