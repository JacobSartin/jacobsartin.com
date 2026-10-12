import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { lazy, Suspense, type ComponentType } from "react";
import Nav from "@/components/Nav";
import HomePage from "@/page";
import AboutPage from "@/about/page";
import SkillsPage from "@/skills/page";
import ProjectsPage from "@/projects/page";
import NotFound from "@/not-found";
import { cards as projectCards } from "@/projects/ProjectCards";
import { pageHead, useDocumentHead } from "@/utils/head";

type PageModule = {
  default: ComponentType;
};

function createLazyPageComponent(loadPage: () => Promise<PageModule>) {
  const LazyPage = lazy(loadPage);

  return function LazyPageComponent() {
    return <LazyPage />;
  };
}

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
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </>
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
  component: AboutPage,
});

const skillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills",
  head: () =>
    pageHead(
      "Skills",
      "Languages, frameworks, databases, tools, and certifications Jacob Sartin works with.",
    ),
  component: SkillsPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  head: () =>
    pageHead(
      "Projects",
      "A portfolio of projects showcasing various technologies and creative solutions.",
    ),
  component: ProjectsPage,
});

const projectPageModules = import.meta.glob<PageModule>(
  "./projects/*/page.tsx",
);

let projectPagesPrefetchPromise: Promise<void> | null = null;

export function prefetchProjectPages() {
  if (!projectPagesPrefetchPromise) {
    projectPagesPrefetchPromise = Promise.allSettled(
      Object.values(projectPageModules).map((loadPage) => loadPage()),
    ).then(() => undefined);
  }

  return projectPagesPrefetchPromise;
}

const projectRoutes = Object.entries(projectPageModules)
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .map(([modulePath, loadPage]) =>
    createRoute({
      getParentRoute: () => rootRoute,
      head: () => getProjectHead(getProjectRoutePath(modulePath)),
      path: getProjectRoutePath(modulePath),
      component: createLazyPageComponent(loadPage),
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

export const router = createRouter({ routeTree, basepath: routerBasePath });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
