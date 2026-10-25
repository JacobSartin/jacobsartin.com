import { createFileRoute } from "@tanstack/react-router";

// The SPA shell hydrates root metadata before matching the visitor's URL.
export const Route = createFileRoute("/_fallback")({ component: () => null });
