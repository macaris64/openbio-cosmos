import { defineConfig } from "vite";

export default defineConfig({
  root: ".", // project root
  publicDir: "public",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: "index.html",
        atlas: "atlas.html",
        article: "article.html",
        articles: "articles.html",
        experiments: "experiments.html",
        geo: "geo.html",
        "knowledge-atlas": "knowledge-atlas.html"
      },
      output: {
        manualChunks: {
          'three': ['three'],
          'd3': ['d3'],
          'chart': ['chart.js'],
          'vis': ['vis-network']
        }
      }
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
});
