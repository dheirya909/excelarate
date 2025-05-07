import { sync } from 'glob';
import { ViteMinifyPlugin } from 'vite-plugin-minify';

export default {
  appType: "mpa", // Enable MPA mode
  root: "./src",
  plugins: [
    ViteMinifyPlugin({}) // Add the minify plugin
  ],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      // Dynamically find all HTML files in the src directory
      input: sync("./src/**/*.html".replace(/\\/g, "/")),
    },
  },
};
