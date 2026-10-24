import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import NotFound from "@/not-found";
import { pageHead } from "@/utils/head";
import { bootstrapScript } from "@/utils/bootstrap";
import "@/globals.css";
import "@/nav.css";

export const Route = createRootRoute({
  head: () => ({
    ...pageHead(null),
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      ...pageHead(null).meta,
    ],
    links: [
      {
        rel: "icon",
        href: import.meta.env.BASE_URL + "favicon.ico",
        sizes: "any",
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400..700&display=swap",
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  component: RootLayout,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootLayout() {
  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
