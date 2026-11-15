import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build` emits ONE self-contained dist/index.html (no external assets),
// which the Socket.IO server can also serve for online play.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: { proxy: { "/socket.io": { target: "http://localhost:3001", ws: true } } },
  test: { include: ["src/**/*.test.ts", "server/**/*.test.ts"] },
} as never);
