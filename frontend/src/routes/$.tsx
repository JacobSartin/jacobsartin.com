import { createFileRoute } from "@tanstack/react-router";
import NotFound from "@/not-found";
import { pageHead } from "@/utils/head";

// Give unknown URLs their own route-owned metadata.
export const Route = createFileRoute("/$")({
  head: () => pageHead("Page Not Found"),
  component: NotFound,
});
