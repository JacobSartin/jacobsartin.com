import { defineConfig, lazyPlugins } from "vite-plus";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { redact } from "@tanstack/redact/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import path from "node:path";
import fs from "node:fs";
import type { Plugin } from "vite-plus";

const rawBasePath = process.env.VITE_BASE_PATH ?? "/";
const normalizedBasePath = rawBasePath === "" ? "/" : rawBasePath;
const base = normalizedBasePath.endsWith("/")
  ? normalizedBasePath
  : `${normalizedBasePath}/`;

export default defineConfig({
  fmt: { printWidth: 80, ignorePatterns: ["src/routeTree.gen.ts"] },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  base,
  environments: {
    client: { build: { outDir: "dist" } },
    ssr: {
      build: { outDir: ".tanstack/server" },
      resolve: { noExternal: true },
    },
  },
  plugins: lazyPlugins(() => [
    redact(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: false,
        failOnError: true,
      },
      spa: {
        enabled: true,
        maskPath: "/_fallback",
        prerender: { outputPath: "/404" },
      },
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    staticPreview(),
  ]),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});

/** Match static-host directory indexes and the generated 404 shell in preview. */
function staticPreview(): Plugin {
  return {
    name: "prerendered-static-preview",
    configurePreviewServer(server) {
      const output = path.resolve(server.config.root, "dist");
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? "/", "http://localhost");
        const basePath = server.config.base.replace(/\/$/, "");
        if (basePath && !url.pathname.startsWith(basePath + "/")) return next();
        let pathname: string;
        try {
          pathname = decodeURIComponent(url.pathname.slice(basePath.length));
        } catch {
          response.statusCode = 400;
          response.end();
          return;
        }
        const directoryIndex = path.resolve(
          output,
          "." + pathname,
          "index.html",
        );
        if (
          directoryIndex.startsWith(output + path.sep) &&
          fs.existsSync(directoryIndex)
        ) {
          request.url =
            basePath + pathname.replace(/\/$/, "") + "/index.html" + url.search;
        } else if (request.headers.accept?.includes("text/html")) {
          const file = path.resolve(output, "." + pathname);
          if (!file.startsWith(output + path.sep) || !fs.existsSync(file)) {
            response.statusCode = 404;
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(fs.readFileSync(path.join(output, "404.html")));
            return;
          }
        }
        next();
      });
    },
  };
}
