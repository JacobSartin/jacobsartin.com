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
import AboutPage from "@/about/page";
import SkillsPage from "@/skills/page";
import ProjectsPage from "@/projects/page";
import NotFound from "@/not-found";

type PageModule = {
  default: ComponentType;
};

function getProjectRoutePath(modulePath: string) {
  return modulePath.replace(/^\./, "").replace(/\/page\.tsx$/, "");
}

function RootLayout() {
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
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const skillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/skills",
  component: SkillsPage,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
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

export const router = createRouter({ routeTree, basepath: routerBasePath });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
