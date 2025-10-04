import { createSlug } from "../helpers/createSlug.js";
import { zonesConfig } from "../zones/zonesConfig.js";

export function createArticleCard(article, modelId = "body") {
  const card = document.createElement("div");
  card.className = "article-card";

  let abstractText = "";
  if (typeof article.abstract === "string") {
    abstractText = article.abstract;
  } else if (article.abstract && typeof article.abstract === "object") {
    abstractText = article.abstract.full || "";
  }

  let zonesWithCategory = [];
  if (article.categories && typeof article.categories === "object") {
    for (const [cat, zones] of Object.entries(article.categories)) {
      zones.forEach((zoneId) => {
        zonesWithCategory.push({ zoneId, category: cat });
      });
    }
  }

  const badgesHtml =
    zonesWithCategory.length > 0
      ? zonesWithCategory
          .map(({ zoneId, category }) => {
            const modelZones = zonesConfig[modelId]?.zones || [];
            const zone = modelZones.find((z) => z.id === zoneId);

            const badgeColor = zone
              ? `#${zone.color.toString(16).padStart(6, "0")}`
              : "#666";

            return `<span class="article-badge" 
                       style="background:${badgeColor}" 
                       title="${category.toUpperCase()}">${zoneId.toUpperCase()}</span>`;
          })
          .join(" ")
      : `<span class="article-badge" style="background:#666">UNKNOWN</span>`;

  const maxLength = 200;
  const isLong = abstractText.length > maxLength;
  const shortText = isLong
    ? abstractText.slice(0, maxLength) + "..."
    : abstractText;

  const slug = createSlug(article.title);

  card.innerHTML = `
    <div class="article-header">
      ${badgesHtml}
      <span class="article-year">${article.year || ""}</span>
    </div>
    <div class="article-title">
      <a href="/article.html?slug=${slug}">${article.title}</a>
    </div>
    <div class="article-abstract">${shortText || ""}</div>
    ${isLong ? `<button class="show-more">Show more</button>` : ""}
    <div class="article-footer">
      <span class="article-category">${article.article_category || ""}</span>
      <a class="article-link" href="${article.link}" target="_blank">Read More</a>
    </div>
  `;

  if (isLong) {
    const abstractDiv = card.querySelector(".article-abstract");
    const btn = card.querySelector(".show-more");
    let expanded = false;

    btn.addEventListener("click", () => {
      expanded = !expanded;
      abstractDiv.textContent = expanded ? abstractText : shortText;
      btn.textContent = expanded ? "Show less" : "Show more";
    });
  }

  return card;
}
