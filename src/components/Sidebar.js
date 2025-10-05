import { createArticleCard } from "./ArticleCard.js";

export function createSidebar() {
  const sidebar = document.createElement("div");
  sidebar.id = "articles-sidebar";

  const headerWrapper = document.createElement("div");
  headerWrapper.id = "articles-header-wrapper";

  const header = document.createElement("div");
  header.id = "articles-header";
  headerWrapper.appendChild(header);

  const closeBtn = document.createElement("button");
  closeBtn.id = "sidebar-close";
  closeBtn.innerHTML = "&times;";
  headerWrapper.appendChild(closeBtn);

  sidebar.appendChild(headerWrapper);

  const container = document.createElement("div");
  container.id = "articles-container";
  sidebar.appendChild(container);

  document.body.appendChild(sidebar);

  return { sidebar, container, header, closeBtn };
}

export function renderArticles(
  container,
  articles,
  sidebar,
  header,
  title,
  modelId,
) {
  container.innerHTML = "";
  articles.forEach((article) => {
    const card = createArticleCard(article, modelId);
    container.appendChild(card);
  });
  sidebar.classList.add("open");
  header.textContent = `Articles for ${title}`;
}

export function closeSidebar(sidebar) {
  sidebar.classList.remove("open");
}
