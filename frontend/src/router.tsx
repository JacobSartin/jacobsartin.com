import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { Suspense, type ComponentType } from "react";
import Nav from "@/components/Nav";
import HomePage from "@/page";
import NotFound from "@/not-found";
import { cards as projectCards } from "@/projects/cards";
import { pageHead, useDocumentHead } from "@/utils/head";

type PageModule = {
  default: ComponentType;
};

function getProjectRoutePath(modulePath: string) {
  return modulePath.replace(/^\./, "").replace(/\/page\.tsx$/, "");
}

// Project pages take their title and description from their card.
function getProjectHead(path: string) {
  const card = projectCards.find((projectCard) => projectCard.link === path);
  return pageHead(card?.title ?? null, card?.subtitle);
}

function RootLayout() {
  useDocumentHead();

  return (
    <>
      <Nav />
      <main>
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}

function PageLoading() {
  return (
    <p className="page-loading" role="status">
      Loading…
    </p>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  head: () => pageHead(null),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  head: () =>
    pageHead(
      "About",
      "About Jacob Sartin, a software developer focused on backend development, DevOps, and systems work.",
    ),
  component: lazyRouteComponent(() => import("@/about/page")),
});

const skillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills",
  head: () =>
    pageHead(
      "Skills",
      "Languages, frameworks, databases, tools, and certifications Jacob Sartin works with.",
    ),
  component: lazyRouteComponent(() => import("@/skills/page")),
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  head: () =>
    pageHead(
      "Projects",
      "A portfolio of projects showcasing various technologies and creative solutions.",
    ),
  component: lazyRouteComponent(() => import("@/projects/page")),
});

const projectPageModules = import.meta.glob<PageModule>(
  "./projects/*/page.tsx",
);

const projectRoutes = Object.entries(projectPageModules)
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .map(([modulePath, loadPage]) =>
    createRoute({
      getParentRoute: () => rootRoute,
      head: () => getProjectHead(getProjectRoutePath(modulePath)),
      path: getProjectRoutePath(modulePath),
      // lazyRouteComponent lets the router load the chunk before rendering,
      // so direct loads and navigations don't suspend into a blank page.
      component: lazyRouteComponent(loadPage),
    }),
  );

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  skillsRoute,
  projectsRoute,
  ...projectRoutes,
]);

const routerBasePath =
  import.meta.env.BASE_URL === "/"
    ? "/"
    : import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createRouter({
  routeTree,
  basepath: routerBasePath,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
