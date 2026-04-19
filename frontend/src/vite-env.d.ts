/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DF_PORT?: string;
  readonly AUTH_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
