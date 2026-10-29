import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NotFound from "@/not-found";
import { pageHead } from "@/utils/head";
import { bootstrapScript } from "@/utils/bootstrap";
import monoFontUrl from "@/assets/jetbrains-mono-latin-wght.woff2?url";
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
      {
        rel: "preload",
        href: monoFontUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
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
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main key={pathname} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
