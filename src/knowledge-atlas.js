import * as d3 from "d3";
import cloud from "d3-cloud";
import * as topojson from "topojson-client";

import { geoCountryMap } from "../public/maps/countryMap.js";
import { createLeftSidebar } from "./components/LeftSidebar.js";
import { createNavbar } from "./components/Navbar.js";

createNavbar();

const contentContainer = document.createElement("div");
contentContainer.className = "atlas-content";
document.body.appendChild(contentContainer);

createLeftSidebar("./data/knowledge-atlas.json", (feature) => {
  renderFeature(feature.id);
});

async function renderFeature(featureId) {
  contentContainer.innerHTML = "";

  const res = await fetch("./data/knowledge_atlas_data.json");
  const atlasData = await res.json();

  if (featureId === "wordcloud") {
    contentContainer.innerHTML = `<h2>Word Cloud</h2>
     <svg id='wordcloud-svg' width='800' height='600'></svg>
     <div id='wordcloud-table-container' style='margin-top:20px;'></div>`;

    const topWords = atlasData.word_cloud.slice(0, 30);

    const maxCount = d3.max(topWords, (d) => d.count);
    const minCount = d3.min(topWords, (d) => d.count);
    const fontScale = d3
      .scaleLinear()
      .domain([minCount, maxCount])
      .range([14, 60]);

    const words = topWords.map((d) => ({
      text: d.term,
      size: fontScale(d.count),
    }));

    const layout = cloud()
      .size([800, 600])
      .words(words)
      .padding(5)
      .rotate(() => (Math.random() > 0.8 ? 90 : 0))
      .font("Arial")
      .fontSize((d) => d.size)
      .on("end", draw);

    layout.start();

    function draw(words) {
      d3.select("#wordcloud-svg")
        .append("g")
        .attr("transform", "translate(400,300)")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => d.size + "px")
        .style(
          "fill",
          () => d3.schemeCategory10[Math.floor(Math.random() * 10)],
        )
        .attr("text-anchor", "middle")
        .attr(
          "transform",
          (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`,
        )
        .text((d) => d.text);
    }

    const tableContainer = document.getElementById("wordcloud-table-container");

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.innerHTML = `
    <thead>
      <tr style="background:#f0f0f0; text-align:left;">
        <th style="padding:8px; border:1px solid #ccc;">Key</th>
        <th style="padding:8px; border:1px solid #ccc;">Count</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

    const tbody = table.querySelector("tbody");

    atlasData.word_cloud.forEach((d) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td style="padding:8px; border:1px solid #ccc;">${d.term}</td>
      <td style="padding:8px; border:1px solid #ccc;">${d.count}</td>
    `;
      tbody.appendChild(row);
    });

    tableContainer.appendChild(table);
  }

  if (featureId === "geo-overlay") {
    contentContainer.innerHTML = `<h2>Geo Overlay</h2>
     <svg id='geo-map' width='800' height='600'></svg>
     <div id='geo-table-container' style='margin-top:20px;'></div>`;

    const svg = d3.select("#geo-map");
    svg.selectAll("*").remove();

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const projection = d3
      .geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);
    const path = d3.geoPath(projection);

    const worldRes = await fetch(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
    );
    const worldData = await worldRes.json();
    const countries = topojson.feature(
      worldData,
      worldData.objects.countries,
    ).features;

    const counts = {};
    atlasData.geo_overlay.forEach((c) => {
      let name = c.country.trim();
      if (geoCountryMap[name]) {
        name = geoCountryMap[name];
      }
      counts[name] = c.terms.reduce((acc, t) => acc + t.count, 0);
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
          .text(() => {
            let lookup = name;
            for (const key in geoCountryMap) {
              if (geoCountryMap[key] === name) lookup = key;
            }
            const countryObj = atlasData.geo_overlay.find(
              (c) => c.country === name || c.country === lookup,
            );
            if (countryObj) {
              const topTerms = countryObj.terms
                .slice(0, 3)
                .map((t) => `${t.term} (${t.count})`)
                .join(", ");
              return `${name}: ${val} terms → ${topTerms}`;
            }
            return `${name}: ${val}`;
          });
      })
      .on("mouseout", function (event, d) {
        const name = d.properties.name;
        d3.select(this).attr(
          "fill",
          counts[name] ? color(counts[name]) : "#eee",
        );
        svg.select("#tooltip").remove();
      });

    const tableContainer = document.getElementById("geo-table-container");

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.innerHTML = `
  <thead>
    <tr style="background:#f0f0f0; text-align:left; cursor:pointer;">
      <th data-sort="country" style="padding:8px; border:1px solid #ccc;">Country ▲</th>
      <th data-sort="total" style="padding:8px; border:1px solid #ccc;">Total Keywords</th>
      <th style="padding:8px; border:1px solid #ccc;">Top 5 Keywords</th>
    </tr>
  </thead>
  <tbody></tbody>
`;

    const tbody = table.querySelector("tbody");

    let tableData = atlasData.geo_overlay.map((c) => {
      let name = c.country.trim();
      if (geoCountryMap[name]) name = geoCountryMap[name];
      const total = c.terms.reduce((acc, t) => acc + t.count, 0);
      const top5 = c.terms
        .slice(0, 5)
        .map((t) => `${t.term} (${t.count})`)
        .join(", ");
      return { country: name, total, top5 };
    });

    tableData.sort((a, b) => a.country.localeCompare(b.country));

    function renderTableRows(data) {
      tbody.innerHTML = "";
      data.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td style="padding:8px; border:1px solid #ccc;">${row.country}</td>
      <td style="padding:8px; border:1px solid #ccc;">${row.total}</td>
      <td style="padding:8px; border:1px solid #ccc;">${row.top5}</td>
    `;
        tbody.appendChild(tr);
      });
    }

    renderTableRows(tableData);

    let currentSort = { key: "country", asc: true };

    table.querySelectorAll("th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.dataset.sort;

        if (currentSort.key === key) {
          currentSort.asc = !currentSort.asc;
        } else {
          currentSort.key = key;
          currentSort.asc = true;
        }

        tableData.sort((a, b) => {
          if (key === "country") {
            return currentSort.asc
              ? a.country.localeCompare(b.country)
              : b.country.localeCompare(a.country);
          } else if (key === "total") {
            return currentSort.asc ? a.total - b.total : b.total - a.total;
          }
          return 0;
        });

        table.querySelectorAll("th[data-sort]").forEach((col) => {
          col.textContent = col.textContent.replace(/ ▲| ▼/, "");
          if (col.dataset.sort === key) {
            col.textContent += currentSort.asc ? " ▲" : " ▼";
          }
        });

        renderTableRows(tableData);
      });
    });

    tableContainer.appendChild(table);
  }
}
