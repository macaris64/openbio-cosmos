import { Network } from "vis-network/standalone";

import { createNavbar } from "./components/Navbar.js";
import { createSlug } from "./helpers/createSlug.js";

createNavbar();

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

document.querySelector(".tabs").addEventListener("click", (e) => {
  if (!e.target.classList.contains("tab")) return;

  const clicked = e.target;
  const targetId = clicked.dataset.tab + "-content";

  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));

  clicked.classList.add("active");
  const content = document.getElementById(targetId);
  if (content) content.classList.add("active");
});

Promise.all([
  fetch("./data/output_nih.json").then((res) => res.json()),
  fetch("./data/article_experiments.json").then((res) => res.json()),
]).then(async ([articles, experiments]) => {
  const article = articles.find((a) => createSlug(a.title) === slug);
  if (!article) {
    document.getElementById("article-title").textContent = "Article not found";
    return;
  }

  document.getElementById("article-title").textContent = article.title;
  document.getElementById("article-meta").textContent =
    `${article.year || ""} · ${article.article_category || ""} · ${article.language || ""}`;

  let abstractText = "";
  if (typeof article.abstract === "string") {
    abstractText = article.abstract;
  } else if (article.abstract && typeof article.abstract === "object") {
    abstractText = article.abstract.full || "";
  }
  document.getElementById("article-abstract").textContent = abstractText;

  renderAuthors(article);

  let journalText = "No journal info";
  if (article.journal && typeof article.journal === "object") {
    const j = article.journal;
    journalText = `${j.name || ""}`;
    if (j.year || j.volume) {
      journalText += ` (${j.year || ""}${j.volume ? ", Vol " + j.volume : ""})`;
    }
    if (j.issue) journalText += ` Issue ${j.issue}`;
    if (j.pages) journalText += `, pp. ${j.pages}`;
  }
  document.getElementById("article-journal").textContent = journalText;

  document.getElementById("article-pmid").textContent = article.pmid || "N/A";
  const doiEl = document.getElementById("article-doi");
  if (article.doi) {
    doiEl.textContent = article.doi;
    doiEl.href = `https://doi.org/${article.doi}`;
  } else {
    doiEl.textContent = "N/A";
    doiEl.removeAttribute("href");
  }

  document.getElementById("article-language").textContent =
    article.language || "N/A";
  document.getElementById("article-country").textContent =
    article.country || "N/A";

  const pubTypesContainer = document.getElementById(
    "article-publication-types",
  );
  pubTypesContainer.innerHTML = "";
  (article.publication_types || []).forEach((t) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = t;
    pubTypesContainer.appendChild(span);
  });

  const meshContainer = document.getElementById("article-mesh");
  meshContainer.innerHTML = "";
  (article.mesh_terms || []).forEach((m) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = m;
    meshContainer.appendChild(span);
  });

  const keywordsContainer = document.getElementById("article-keywords");
  keywordsContainer.innerHTML = "";
  (article.keywords || []).forEach((k) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = k;
    keywordsContainer.appendChild(span);
  });

  const tagsContainer = document.getElementById("article-tags");
  tagsContainer.innerHTML = "";
  (article.tags || []).forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    tagsContainer.appendChild(span);
  });

  const categoriesContainer = document.getElementById("article-categories");
  categoriesContainer.innerHTML = "";
  if (article.categories && Object.keys(article.categories).length > 0) {
    Object.entries(article.categories).forEach(([cat, zones]) => {
      (zones || []).forEach((z) => {
        const span = document.createElement("span");
        span.className = "category-badge";
        span.textContent = `${cat}: ${z}`;
        categoriesContainer.appendChild(span);
      });
    });
  } else {
    categoriesContainer.textContent = "No categories available";
  }

  if (article.knowledge_graph && article.knowledge_graph.length > 0) {
    renderGraph(article.knowledge_graph);
  } else {
    document.getElementById("graph-viz").innerHTML =
      "<p>No knowledge graph data</p>";
  }

  document.getElementById("article-link").href = article.link || "#";

  document.getElementById("article-link").href = article.link || "#";

  const relatedExps = experiments.filter((e) => e.articleId === article.id);
  if (relatedExps.length > 0) {
    const tabsContainer = document.querySelector(".tabs");
    const expTab = document.createElement("div");
    expTab.className = "tab";
    expTab.dataset.tab = "experiments";
    expTab.textContent = "Experiments";
    tabsContainer.appendChild(expTab);
    tabsContainer.insertBefore(
      expTab,
      document.getElementById("go-experiments"),
    );

    const expContent = document.createElement("div");
    expContent.id = "experiments-content";
    expContent.className = "tab-content";
    expContent.innerHTML = `<h3>Experiments linked to this article</h3><div id="experiment-list"></div>`;
    document.querySelector("main").appendChild(expContent);

    const list = expContent.querySelector("#experiment-list");
    relatedExps.forEach((exp) => {
      const card = document.createElement("div");
      card.className = "info-block";
      card.innerHTML = `
        <h3>${exp.title}</h3>
        <p><b>Type:</b> ${exp.type}</p>
        <p><b>Duration:</b> ${exp.duration}</p>
        <p><b>Subjects:</b> ${exp.subjects}</p>
        <p><b>Conditions:</b> ${exp.conditions.join(", ")}</p>
        <p><b>Outcomes:</b> ${exp.outcomes.join(", ")}</p>
        <p><b>Location:</b> ${exp.location}</p>
        <p><b>Year:</b> ${exp.year}</p>
      `;
      list.appendChild(card);
    });

    expTab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      expTab.classList.add("active");
      expContent.classList.add("active");
    });
  }

  const pdfUrl = await fetchPdfUrl(article.doi);
  const pdfContainer = document.getElementById("pdf-container");

  if (pdfUrl) {
    pdfContainer.innerHTML = `
    <a href="${pdfUrl}" target="_blank" id="pdf-download"
       style="display:inline-block; background:#2563eb; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:600;">
       Download PDF
    </a>
  `;
  } else {
    pdfContainer.innerHTML =
      "<p>No Open Access PDF available for this article.</p>";
  }

  const referencesContainer = document.getElementById("references-list");

  if (article.doi) {
    try {
      const crossrefUrl = `https://api.crossref.org/works/${article.doi}`;
      const res = await fetch(crossrefUrl);
      const data = await res.json();
      const refs = data.message.reference || [];

      if (refs.length > 0) {
        referencesContainer.innerHTML = "";
        refs.forEach((ref, idx) => {
          const div = document.createElement("div");
          div.style.marginBottom = "12px";

          const refText =
            ref.unstructured ||
            `${ref.author || ""} (${ref.year || ""}) ${ref["journal-title"] || ""}`;

          if (ref.DOI) {
            div.innerHTML = `${idx + 1}. <a href="https://doi.org/${ref.DOI}" target="_blank">${refText}</a>`;
          } else {
            div.textContent = `${idx + 1}. ${refText}`;
          }

          referencesContainer.appendChild(div);
        });
      } else {
        referencesContainer.innerHTML =
          "<p>No references found in CrossRef.</p>";
      }
    } catch (err) {
      console.error("CrossRef fetch error", err);
      referencesContainer.innerHTML = "<p>Failed to load references.</p>";
    }
  } else {
    referencesContainer.innerHTML = "<p>No DOI available for references.</p>";
  }
});

function renderGraph(triples) {
  const nodesMap = new Map();
  const edges = [];

  triples.forEach((t) => {
    if (!nodesMap.has(t.subject)) {
      nodesMap.set(t.subject, {
        id: t.subject,
        label: t.subject,
        color: "#2563eb",
      });
    }
    if (!nodesMap.has(t.object)) {
      nodesMap.set(t.object, {
        id: t.object,
        label: t.object,
        color: "#10b981",
      });
    }
    edges.push({
      from: t.subject,
      to: t.object,
      label: t.predicate,
      arrows: "to",
    });
  });

  const data = {
    nodes: Array.from(nodesMap.values()),
    edges: edges,
  };

  const container = document.getElementById("graph-viz");
  const options = {
    physics: { enabled: true },
    nodes: {
      shape: "dot",
      size: 15,
      font: { size: 7, color: "#111", face: "Inter", vadjust: 0 },
    },
    edges: {
      arrows: "to",
      font: { size: 7, align: "middle", color: "#444" },
      smooth: { type: "dynamic" },
    },
  };

  const network = new Network(container, data, options);
  network.once("stabilizationIterationsDone", function () {
    network.moveTo({
      scale: 1,
      position: { x: -450, y: -400 },
      animation: true,
    });
  });
}

async function fetchOrcid(firstName, lastName, doi) {
  const url = `https://pub.orcid.org/v3.0/search/?q=given-names:${encodeURIComponent(firstName)}+AND+family-name:${encodeURIComponent(lastName)}+AND+digital-object-ids:${encodeURIComponent(doi)}`;

  const res = await fetch(url, {
    headers: { Accept: "application/xml" },
  });
  const text = await res.text();

  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");

  let uriNode = xml.getElementsByTagName("common:uri")[0];
  if (!uriNode) {
    uriNode = xml.getElementsByTagNameNS("*", "uri")[0];
  }

  return uriNode ? uriNode.textContent : null;
}

async function renderAuthors(article) {
  const container = document.getElementById("article-authors");
  container.innerHTML = "";

  for (const a of article.authors || []) {
    const div = document.createElement("div");
    div.textContent = `${a.fore_name} ${a.last_name}`;

    try {
      const orcid = await fetchOrcid(a.fore_name, a.last_name, article.doi);
      if (orcid) {
        const link = document.createElement("a");
        link.href = orcid;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.innerHTML = `<img src="https://orcid.org/sites/default/files/images/orcid_16x16.png" alt="ORCID"/>`;
        link.style.marginLeft = "6px";
        div.appendChild(link);
      }
    } catch (err) {
      console.error("ORCID fetch error", err);
    }

    container.appendChild(div);
  }
}

async function fetchPdfUrl(doi) {
  const email = "mehmetacar.6434@gmail.com"; // Unpaywall için gerekli
  const url = `https://api.unpaywall.org/v2/${doi}?email=${email}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.best_oa_location && data.best_oa_location.url_for_pdf) {
      return data.best_oa_location.url_for_pdf;
    }
  } catch (err) {
    console.error("Unpaywall PDF fetch error", err);
  }
  return null;
}
