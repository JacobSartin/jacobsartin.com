import { createFileRoute } from "@tanstack/react-router";
import AboutPage from "@/about/page";
import { pageHead } from "@/utils/head";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead(
      "About",
      "About Jacob Sartin, a software developer focused on backend development, DevOps, and systems work.",
    ),
  component: AboutPage,
});
