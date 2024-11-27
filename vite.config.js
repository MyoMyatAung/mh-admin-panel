// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        // Customize the Ant Design theme variables here
        modifyVars: {
          "primary-color": "#1DA57A", // Example: Change primary color
          "background-color": "#141414", // Example: Background color for dark mode
        },
        javascriptEnabled: true,
      },
    },
  },
  define: {
    global: {},
  },
});
