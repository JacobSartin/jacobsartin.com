import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/**
 * Client-side navigation keeps the document, so the browser neither resets
 * focus nor reads out a new title. Once a route has rendered, move focus to
 * its content and announce the page.
 */
export default function RouteAnnouncer() {
  const router = useRouter();
  const [title, setTitle] = useState("");

  useEffect(
    () =>
      router.subscribe("onRendered", (event) => {
        // The first load is announced by the browser, and hash-only changes
        // such as the skip link stay on the same page.
        if (!event.fromLocation || !event.pathChanged) return;
        document.getElementById("main-content")?.focus({ preventScroll: true });
        setTitle(document.title);
      }),
    [router],
  );

  return (
    <p className="sr-only" aria-live="polite" role="status">
      {title}
    </p>
  );
}
