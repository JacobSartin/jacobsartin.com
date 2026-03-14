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

function RootLayout() {
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

const projectRoutes = Object.entries(projectPageModules)
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .map(([modulePath, loadPage]) =>
    createRoute({
      getParentRoute: () => rootRoute,
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

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
