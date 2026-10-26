import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultViewTransition: {
      types: ({ pathChanged }) =>
        pathChanged &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? ["navigation"]
          : false,
    },
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
