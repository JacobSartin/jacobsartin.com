import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Nav from "@/components/Nav";
import NotFound from "@/not-found";
import { pageHead } from "@/utils/head";

export const Route = createRootRoute({
  head: () => pageHead(null),
  notFoundComponent: NotFound,
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <HeadContent />
      <Nav />
      <main>
        <Outlet />
      </main>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
