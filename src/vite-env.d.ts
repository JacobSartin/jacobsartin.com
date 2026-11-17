/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMIT_SHA?: string;
}

interface Window {
  /** Optional chunk loads in flight; see `src/utils/bootstrap.ts`. */
  __optionalChunkLoads?: number;
}
