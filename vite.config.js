import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The preview harness assigns a free port via PORT; fall back to Vite's defaults.
const port = process.env.PORT ? Number(process.env.PORT) : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    open: "/index.html",
    port,
  },
  preview: {
    port,
  },
});
