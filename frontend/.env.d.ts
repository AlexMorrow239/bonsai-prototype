/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
