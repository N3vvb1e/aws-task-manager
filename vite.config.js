import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      // Add proxies for API calls if needed
      // '/api': {
      //   target: 'https://your-api-gateway-url.amazonaws.com',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, ''),
      // },
    },
  },
  define: {
    // Provide environment variables to the client
    // Prefix with VITE_ to make them accessible via import.meta.env
    "import.meta.env.VITE_AWS_REGION": JSON.stringify("us-east-1"),
  },
  build: {
    outDir: "dist",
    sourcemap: process.env.NODE_ENV !== "production",
  },
});
