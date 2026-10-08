import { useLocation, useMatches } from "@tanstack/react-router";
import { useEffect } from "react";

export const SITE_NAME = "Jacob Sartin";
export const SITE_URL = "https://jacobsartin.com";
export const DEFAULT_DESCRIPTION =
  "Software developer passionate about creating elegant solutions to complex problems.";

const NOT_FOUND_HEAD = pageHead("Page Not Found").meta;

type MetaTag = { title?: string; name?: string; content?: string };
type HeadMatch = {
  meta?: unknown;
  status?: string;
  globalNotFound?: boolean;
};

/** Builds a route `head` value with a page title and meta description. */
export function pageHead(title: string | null, description?: string) {
  return {
    meta: [
      { title: title ? `${title} | ${SITE_NAME}` : SITE_NAME },
      { name: "description", content: description ?? DEFAULT_DESCRIPTION },
    ],
  };
}

function setMetaContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content);
}

function setCanonicalUrl(url: string) {
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
  setMetaContent('meta[property="og:url"]', url);
}

// Returns the value from the deepest matched route that defines one.
function findMeta(
  matches: Array<HeadMatch>,
  pick: (tag: MetaTag) => string | undefined,
  fallback: string,
) {
  let value = fallback;
  for (const match of matches) {
    const isNotFound = match.globalNotFound || match.status === "notFound";
    const tags = isNotFound ? NOT_FOUND_HEAD : match.meta;
    for (const tag of (tags ?? []) as Array<MetaTag | undefined>) {
      const picked = tag && pick(tag);
      if (picked) value = picked;
    }
  }
  return value;
}

/**
 * Syncs the matched routes' `head` title/description into the static tags in
 * index.html (including the Open Graph and Twitter equivalents), and points the
 * canonical/og:url tags at the current path on the canonical domain.
 */
export function useDocumentHead() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const title = useMatches({
    select: (matches) => findMeta(matches, (tag) => tag.title, SITE_NAME),
  });
  const description = useMatches({
    select: (matches) =>
      findMeta(
        matches,
        (tag) => (tag.name === "description" ? tag.content : undefined),
        DEFAULT_DESCRIPTION,
      ),
  });

  useEffect(() => {
    document.title = title;
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[name="twitter:title"]', title);
  }, [title]);

  useEffect(() => {
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:description"]', description);
  }, [description]);

  useEffect(() => {
    const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    setCanonicalUrl(`${SITE_URL}${path}`);
  }, [pathname]);
}
