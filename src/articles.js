import Chart from "chart.js/auto";
import * as d3 from "d3";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";

import { geoCountryMap } from "../public/maps/countryMap.js";
import { createNavbar } from "./components/Navbar.js";
import { createSlug } from "./helpers/createSlug.js";

createNavbar();

let allArticles = [];
let allExperiments = [];
let currentPage = 1;
const perPage = 5;
let minYear = 9999;
let maxYear = 0;

const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const categorySelect = document.getElementById("filter-category");
const zoneSelect = document.getElementById("filter-zone");
const yearMinInput = document.getElementById("year-min");
const yearMaxInput = document.getElementById("year-max");
const yearMinLabel = document.getElementById("year-min-label");
const yearMaxLabel = document.getElementById("year-max-label");
const clearBtn = document.getElementById("clear-filters");

const articleList = document.getElementById("article-list");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

const withExperimentsCheckbox = document.getElementById("filter-experiments");

let barChart, pieChart;
let barChartReady = false;
let pieChartReady = false;
let geoMapReady = false;
let lineChartReady = false;
let stackedAreaReady = false;

/* -----------------------
   FILTRATION
----------------------- */
function getFilteredArticles() {
  let filtered = [...allArticles];

  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter((a) =>
      a.title.toLowerCase().includes(searchTerm),
    );
  }

  const selectedCategories = Array.from(categorySelect.selectedOptions).map(
    (o) => o.value,
  );
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(
      (a) =>
        a.categories &&
        Object.keys(a.categories).some((cat) =>
          selectedCategories.includes(cat),
        ),
    );
  }

  const selectedZones = Array.from(zoneSelect.selectedOptions).map(
    (o) => o.value,
  );
  if (selectedZones.length > 0) {
    filtered = filtered.filter(
      (a) =>
        a.categories &&
        Object.values(a.categories).some((zs) =>
          zs.some((z) => selectedZones.includes(z)),
        ),
    );
  }

  const minSelected = parseInt(yearMinInput.value);
  const maxSelected = parseInt(yearMaxInput.value);
  filtered = filtered.filter((a) => {
    const y = parseInt(a.year);
    return !isNaN(y) && y >= minSelected && y <= maxSelected;
  });

  const sortValue = sortSelect.value;
  filtered.sort((a, b) => {
    if (sortValue === "year") return (b.year || 0) - (a.year || 0);
    if (sortValue === "title") return a.title.localeCompare(b.title);
    if (sortValue === "journal")
      return (a.journal?.name || "").localeCompare(b.journal?.name || "");
    return 0;
  });

  if (withExperimentsCheckbox.checked) {
    const articleIdsWithExp = new Set(allExperiments.map((e) => e.articleId));
    filtered = filtered.filter((a) => articleIdsWithExp.has(a.id));
  }

  return filtered;
}

/* -----------------------
   RENDER ARTICLES
----------------------- */
function renderArticles() {
  const filtered = getFilteredArticles();

  const totalPages = Math.ceil(filtered.length / perPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const start = (currentPage - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  articleList.innerHTML = "";
  paginated.forEach((article) => {
    const card = document.createElement("div");
    card.className = "article-card";
    card.innerHTML = `
      <h4>${article.title}</h4>
      <p>${article.year || ""} · ${article.journal?.name || ""}</p>
    `;
    card.addEventListener("click", () => {
      window.location.href = `article.html?slug=${createSlug(article.title)}`;
    });
    articleList.appendChild(card);
  });

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;

  barChartReady = pieChartReady = geoMapReady = false;
}

/* -----------------------
   POPULATE FILTERS
----------------------- */
function populateFilters() {
  const categories = new Set();
  const zones = new Set();
  minYear = 9999;
  maxYear = 0;

  allArticles.forEach((a) => {
    if (a.categories) {
      Object.keys(a.categories).forEach((cat) => categories.add(cat));
      Object.values(a.categories).forEach((zs) =>
        zs.forEach((z) => zones.add(z)),
      );
    }
    if (a.year) {
      const y = parseInt(a.year);
      if (!isNaN(y)) {
        minYear = Math.min(minYear, y);
        maxYear = Math.max(maxYear, y);
      }
    }
  });

  categorySelect.innerHTML = [...categories]
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");
  zoneSelect.innerHTML = [...zones]
    .map((z) => `<option value="${z}">${z}</option>`)
    .join("");

  yearMinInput.min = minYear;
  yearMinInput.max = maxYear;
  yearMaxInput.min = minYear;
  yearMaxInput.max = maxYear;
  yearMinInput.value = minYear;
  yearMaxInput.value = maxYear;
  yearMinLabel.textContent = minYear;
  yearMaxLabel.textContent = maxYear;
  if (withExperimentsCheckbox) {
    withExperimentsCheckbox.checked = false;
  }
}

/* -----------------------
   VISUALIZATIONS
----------------------- */
function renderBarChart(filtered) {
  const years = {};
  filtered.forEach((a) => {
    if (a.year) years[a.year] = (years[a.year] || 0) + 1;
  });

  const ctx = document.getElementById("bar-chart");
  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(years),
      datasets: [
        {
          label: "Articles per Year",
          data: Object.values(years),
          backgroundColor: "#2563eb",
        },
      ],
    },
  });
  barChartReady = true;
}

function renderPieChart(filtered) {
  const categories = {};
  filtered.forEach((a) => {
    if (a.categories) {
      Object.keys(a.categories).forEach((c) => {
        categories[c] = (categories[c] || 0) + 1;
      });
    }
  });

  const ctx = document.getElementById("pie-chart");
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            "#2563eb",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
          ],
        },
      ],
    },
  });
  pieChartReady = true;
}

function renderGeoMap(filtered) {
  const svg = d3.select("#geo-map");
  svg.selectAll("*").remove();

  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const projection = d3
    .geoMercator()
    .scale(50)
    .translate([width / 2, height / 1.5]);
  const path = d3.geoPath(projection);

  const countries = feature(worldData, worldData.objects.countries).features;

  const counts = {};
  filtered.forEach((a) => {
    if (a.country) {
      let c = a.country.trim();
      if (geoCountryMap[c]) c = geoCountryMap[c];
      counts[c] = (counts[c] || 0) + 1;
    }
  });

  const maxCount = d3.max(Object.values(counts)) || 1;
  const color = d3.scaleSequential(d3.interpolateBlues).domain([0, maxCount]);

  svg
    .append("g")
    .selectAll("path")
    .data(countries)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const name = d.properties.name;
      return counts[name] ? color(counts[name]) : "#eee";
    })
    .attr("stroke", "#999")
    .on("mouseover", function (event, d) {
      const name = d.properties.name;
      const val = counts[name] || 0;
      d3.select(this).attr("fill", "orange");

      svg
        .append("text")
        .attr("id", "tooltip")
        .attr("x", 10)
        .attr("y", 20)
        .attr("font-size", "12px")
        .attr("fill", "#111")
        .text(`${name}: ${val}`);
    })
    .on("mouseout", function (event, d) {
      const name = d.properties.name;
      d3.select(this).attr("fill", counts[name] ? color(counts[name]) : "#eee");
      svg.select("#tooltip").remove();
    });

  geoMapReady = true;
}

function renderLineChart(filtered) {
  const yearlyCounts = {};
  filtered.forEach((a) => {
    const y = parseInt(a.year);
    if (!isNaN(y)) yearlyCounts[y] = (yearlyCounts[y] || 0) + 1;
  });

  const years = Object.keys(yearlyCounts).sort();
  const values = years.map((y) => yearlyCounts[y]);

  const ctx = document.getElementById("line-chart");
  if (window.lineChart) window.lineChart.destroy();
  window.lineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: "Articles per Year",
          data: values,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.2)",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Year" } },
        y: { title: { display: true, text: "Articles" }, beginAtZero: true },
      },
    },
  });
  lineChartReady = true;
}

function renderStackedAreaChart(filtered) {
  const categoryYearCounts = {};

  filtered.forEach((a) => {
    const y = parseInt(a.year);
    if (isNaN(y)) return;
    if (!a.categories) return;

    Object.keys(a.categories).forEach((cat) => {
      if (!categoryYearCounts[cat]) categoryYearCounts[cat] = {};
      categoryYearCounts[cat][y] = (categoryYearCounts[cat][y] || 0) + 1;
    });
    stackedAreaReady = true;
  });

  const years = [
    ...new Set(filtered.map((a) => parseInt(a.year)).filter(Boolean)),
  ].sort();

  const datasets = Object.keys(categoryYearCounts).map((cat, i) => ({
    label: cat,
    data: years.map((y) => categoryYearCounts[cat][y] || 0),
    backgroundColor: `hsla(${(i * 50) % 360},70%,60%,0.6)`,
    borderColor: `hsla(${(i * 50) % 360},70%,40%,1)`,
    fill: true,
  }));

  const ctx = document.getElementById("stacked-area-chart");
  if (window.stackedAreaChart) window.stackedAreaChart.destroy();
  window.stackedAreaChart = new Chart(ctx, {
    type: "line",
    data: { labels: years, datasets },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      stacked: true,
      scales: {
        x: { title: { display: true, text: "Year" } },
        y: { stacked: true, title: { display: true, text: "Articles" } },
      },
    },
  });
}

/* -----------------------
   EVENTS
----------------------- */
document.querySelectorAll(".viz-header").forEach((header) => {
  header.addEventListener("click", () => {
    const section = header.parentElement;
    const targetId = header.dataset.target;
    section.classList.toggle("active");

    if (section.classList.contains("active")) {
      const filtered = getFilteredArticles();
      if (targetId === "bar-chart-container" && !barChartReady)
        renderBarChart(filtered);
      if (targetId === "pie-chart-container" && !pieChartReady)
        renderPieChart(filtered);
      if (targetId === "geo-map-container" && !geoMapReady)
        renderGeoMap(filtered);
      if (targetId === "line-chart-container" && !lineChartReady)
        renderLineChart(filtered);
      if (targetId === "stacked-area-container" && !stackedAreaReady)
        renderStackedAreaChart(filtered);
    }
  });
});

document.querySelectorAll(".filter-header").forEach((header) => {
  header.addEventListener("click", () => {
    header.parentElement.classList.toggle("active");
  });
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  Array.from(categorySelect.options).forEach((o) => (o.selected = false));
  Array.from(zoneSelect.options).forEach((o) => (o.selected = false));
  yearMinInput.value = minYear;
  yearMaxInput.value = maxYear;
  yearMinLabel.textContent = minYear;
  yearMaxLabel.textContent = maxYear;
  withExperimentsCheckbox.checked = false;
  currentPage = 1;
  renderArticles();
});

[
  searchInput,
  sortSelect,
  categorySelect,
  zoneSelect,
  yearMinInput,
  yearMaxInput,
].forEach((el) => {
  el.addEventListener("input", () => {
    currentPage = 1;
    renderArticles();
  });
});

withExperimentsCheckbox.addEventListener("change", () => {
  currentPage = 1;
  renderArticles();
});
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderArticles();
  }
});
nextBtn.addEventListener("click", () => {
  currentPage++;
  renderArticles();
});

document.getElementById("viz-refresh").addEventListener("click", () => {
  barChartReady = pieChartReady = geoMapReady = false;
  const filtered = getFilteredArticles();
  document
    .querySelectorAll(".viz-section.active .viz-content")
    .forEach((section) => {
      if (section.id === "bar-chart-container") renderBarChart(filtered);
      if (section.id === "pie-chart-container") renderPieChart(filtered);
      if (section.id === "geo-map-container") renderGeoMap(filtered);
    });
});

/* -----------------------
   LOAD DATA
----------------------- */
Promise.all([
  fetch("./data/output_nih.json").then((res) => res.json()),
  fetch("./data/article_experiments.json").then((res) => res.json()),
]).then(([articles, experiments]) => {
  allArticles = articles;
  allExperiments = experiments;
  populateFilters();
  renderArticles();
});
