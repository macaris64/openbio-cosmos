import { createNavbar } from "./components/Navbar.js";
import { createSlug } from "./helpers/createSlug.js";

createNavbar();

async function loadExperiments() {
  try {
    const resExp = await fetch("./data/article_experiments.json");
    const experiments = await resExp.json();

    const resArticles = await fetch("./data/output_nih.json");
    const articles = await resArticles.json();

    const container = document.getElementById("experiments-list");

    experiments.forEach((exp) => {
      const card = document.createElement("div");
      card.className = "experiment-card";

      const relatedArticle = articles.find((a) => a.id === exp.articleId);
      let slugLink = "#";
      if (relatedArticle) {
        slugLink = `article.html?slug=${createSlug(relatedArticle.title)}`;
      }

      card.innerHTML = `
        <div class="experiment-title">${exp.title}</div>
        <div class="experiment-meta">${exp.type} · ${exp.year} · ${exp.location}</div>
        <div class="experiment-section"><strong>Duration:</strong> ${exp.duration}</div>
        <div class="experiment-section"><strong>Subjects:</strong> ${exp.subjects}</div>
        <div class="experiment-section"><strong>Conditions:</strong> ${exp.conditions.join(", ")}</div>
        <div class="experiment-section"><strong>Outcomes:</strong> ${exp.outcomes.join(", ")}</div>
        <div class="experiment-section"><a href="${slugLink}" style="color:#0066cc;">View related article</a></div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading experiments:", err);
  }
}

loadExperiments();
