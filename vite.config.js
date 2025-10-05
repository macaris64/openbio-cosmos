import { defineConfig } from "vite";

export default defineConfig({
  root: ".", // project root
  publicDir: "public",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
        atlas: "atlas.html",
        article: "article.html",
        articles: "articles.html",
        experiments: "experiments.html",
        geo: "geo.html",
        "knowledge-atlas": "knowledge-atlas.html"
      }
    }
  }
});
