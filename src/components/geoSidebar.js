import { createSlug } from "../helpers/createSlug.js";

export function renderGeoSidebar(countryName, articles) {
  const header = document.querySelector(".country-header");
  const list = document.getElementById("article-list");

  header.textContent = `${countryName} (${articles.length} articles)`;
  list.innerHTML = "";

  if (articles.length === 0) {
    list.innerHTML = `
      <div class="no-articles">
        <p>No articles available for this country.</p>
      </div>
    `;
    return;
  }

  articles.forEach((a) => {
    const card = document.createElement("div");
    card.className = "article-card";

    const slug = createSlug(a.title || "untitled");

    card.innerHTML = `
      <div class="article-card-content">
        <div class="article-title">${a.title || "Untitled"}</div>
        <div class="article-meta">
          <span>${a.year || ""}</span> · 
          <span>${a.article_category || ""}</span>
        </div>
        <div class="article-link">Read more →</div>
      </div>
    `;

    card.addEventListener("click", () => {
      window.open(`/article.html?slug=${slug}`, "_blank");
    });

    list.appendChild(card);
  });
}
