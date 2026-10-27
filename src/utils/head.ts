import { cards } from "@/projects/cards";

export const SITE_NAME = "Jacob Sartin";
export const DEFAULT_DESCRIPTION =
  "Software developer passionate about creating elegant solutions to complex problems.";

/** Route-owned metadata, including social sharing tags. */
export function pageHead(
  title: string | null,
  description = DEFAULT_DESCRIPTION,
) {
  const fullTitle = title ? title + " | " + SITE_NAME : SITE_NAME;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
    ],
  };
}

export function projectHead(path: string) {
  const card = cards.find((project) => project.link === path);
  return pageHead(card?.title ?? null, card?.subtitle);
}
