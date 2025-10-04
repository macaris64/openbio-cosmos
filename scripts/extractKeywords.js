import fs from "fs";

// input ve output path
const inputPath = "./public/data/output_nih.json";
const outputPath = "./public/data/knowledge_atlas_data.json";

// input json oku
const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

// ------------------------------
// WORD CLOUD
// ------------------------------
const freq = {};
data.forEach((a) => {
  const allTerms = [
    ...(a.mesh_terms || []),
    ...(a.keywords || []),
    ...(a.tags || []),
  ];
  allTerms.forEach((term) => {
    const key = term.toLowerCase().trim();
    if (!freq[key]) freq[key] = 0;
    freq[key]++;
  });
});

const wordCloud = Object.entries(freq)
  .map(([term, count]) => ({ term, count }))
  .sort((a, b) => b.count - a.count);

// ------------------------------
// GEO OVERLAY
// ------------------------------
// country -> term -> count
const geoOverlay = {};

data.forEach((a) => {
  const country = (a.country || "Unknown").trim();
  if (!geoOverlay[country]) geoOverlay[country] = {};

  const allTerms = [
    ...(a.mesh_terms || []),
    ...(a.keywords || []),
    ...(a.tags || []),
  ];
  allTerms.forEach((term) => {
    const key = term.toLowerCase().trim();
    if (!geoOverlay[country][key]) geoOverlay[country][key] = 0;
    geoOverlay[country][key]++;
  });
});

// Her ülke için { country, terms: [{term, count}, ...] } formatına çevir
const geoOverlayArray = Object.entries(geoOverlay).map(([country, terms]) => ({
  country,
  terms: Object.entries(terms)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count),
}));

// ------------------------------
// FINAL OUTPUT
// ------------------------------
const finalOutput = {
  word_cloud: wordCloud,
  geo_overlay: geoOverlayArray,
};

fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2));
