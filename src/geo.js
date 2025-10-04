import { geoCountryMap } from "../public/maps/countryMap.js";
import { renderGeoSidebar } from "./components/geoSidebar.js";

function getColor(count) {
  return count > 100
    ? "#08306b"
    : count > 50
      ? "#2171b5"
      : count > 20
        ? "#4292c6"
        : count > 10
          ? "#6baed6"
          : count > 5
            ? "#9ecae1"
            : count > 0
              ? "#c6dbef"
              : "#f7fbff";
}

async function loadArticles() {
  const res = await fetch("./data/output_nih.json");
  return res.json();
}

async function initMap() {
  const articles = await loadArticles();

  const countryArticles = {};

  articles.forEach((a) => {
    const rawCountry = a.country || "Unknown";
    const normalizedCountry = geoCountryMap[rawCountry] || rawCountry;

    if (!countryArticles[normalizedCountry]) {
      countryArticles[normalizedCountry] = [];
    }
    countryArticles[normalizedCountry].push(a);
  });

  // eslint-disable-next-line no-undef
  const map = L.map("map").setView([20, 0], 2);

  // eslint-disable-next-line no-undef
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const geoRes = await fetch(
    "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json",
  );
  const geoData = await geoRes.json();

  // eslint-disable-next-line no-undef
  L.geoJSON(geoData, {
    style: (feature) => {
      const countryName = feature.properties.name;
      const count = countryArticles[countryName]?.length || 0;

      return {
        fillColor: getColor(count),
        fillOpacity: 0.8,
        color: "#333",
        weight: 1,
      };
    },
    onEachFeature: (feature, layer) => {
      const countryName = feature.properties.name;
      const count = countryArticles[countryName]?.length || 0;

      layer.bindTooltip(`${countryName}: ${count} articles`);

      layer.on("click", () => {
        const articlesForCountry = countryArticles[countryName] || [];
        renderGeoSidebar(countryName, articlesForCountry);
      });

      layer.on("mouseover", () => {
        layer.setStyle({
          weight: 2,
          color: "#000",
        });
      });
      layer.on("mouseout", () => {
        layer.setStyle({
          weight: 1,
          color: "#333",
        });
      });
    },
  }).addTo(map);
}

initMap();
