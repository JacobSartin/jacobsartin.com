import { fileURLToPath } from "node:url";

// Shared by the bundler and standalone generation before checks.
export const routerConfig = {
  routesDirectory: fileURLToPath(new URL("./src/routes", import.meta.url)),
  generatedRouteTree: fileURLToPath(
    new URL("./.tanstack/routeTree.gen.ts", import.meta.url),
  ),
  quoteStyle: "double",
  semicolons: true,
};
