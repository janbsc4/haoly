import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    css: true,
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
      },
    },
    // Component tests exercise the study app as a guest. CI exports the real
    // PUBLIC_FIREBASE_* values for the static build in the same job, which
    // would otherwise make these tests load the live Firebase bundle. Pin
    // them empty so the component tests stay deterministic in every
    // environment; authenticated behavior is covered by tests that inject a
    // Firebase client (tests/useProgressSync.test.tsx).
    env: {
      PUBLIC_FIREBASE_API_KEY: "",
      PUBLIC_FIREBASE_AUTH_DOMAIN: "",
      PUBLIC_FIREBASE_PROJECT_ID: "",
      PUBLIC_FIREBASE_STORAGE_BUCKET: "",
      PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "",
      PUBLIC_FIREBASE_APP_ID: "",
    },
  },
});
