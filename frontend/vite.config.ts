import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const rawBasePath = process.env.VITE_BASE_PATH ?? "/";
const normalizedBasePath = rawBasePath === "" ? "/" : rawBasePath;
const base = normalizedBasePath.endsWith("/")
  ? normalizedBasePath
  : `${normalizedBasePath}/`;

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
