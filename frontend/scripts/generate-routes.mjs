import { Generator, getConfig } from "@tanstack/router-generator";
import { fileURLToPath } from "node:url";
import { routerConfig } from "../router.config.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const config = getConfig(routerConfig, root);
await new Generator({ config, root }).run();
