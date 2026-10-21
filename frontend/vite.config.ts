import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";
import path from "node:path";

const rawBasePath = process.env.VITE_BASE_PATH ?? "/";
const normalizedBasePath = rawBasePath === "" ? "/" : rawBasePath;
const base = normalizedBasePath.endsWith("/")
  ? normalizedBasePath
  : `${normalizedBasePath}/`;

export default defineConfig({
  fmt: { printWidth: 80 },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  base,
  plugins: lazyPlugins(() => [react()]),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
