# OpenBio Cosmos

### AI-Powered Knowledge Graph for NASA Space Biology Experiments

> A dynamic dashboard that transforms NASA’s bioscience research into an interactive knowledge map — connecting human, plant, and microbial studies across space missions.

---

## Challenge Context

**NASA Space Apps Challenge 2025 – “Build a Space Biology Knowledge Engine”**

Enable a new era of human space exploration! NASA has conducted biology experiments in space for decades, producing vast datasets about how living systems respond to microgravity and radiation. OpenBio Cosmos leverages artificial intelligence (AI), knowledge graphs, and interactive visualization to summarize 600+ NASA bioscience studies, allowing scientists and mission planners to explore patterns, gaps, and experiment outcomes with ease.

---

## Project Summary

**OpenBio Cosmos** is an intelligent web platform that integrates data from NASA’s Open Science Data Repository (OSDR) and GeneLab to visualize relationships between space biology experiments, organisms, body systems, and mission outcomes.

### Key Features

- Automatically categorizes 5000+ bioscience publications by organism, system (e.g., nervous, cardiovascular), and experimental context.
- Interactive network built with Vis.js that links studies, biological systems, and outcomes.
- Displays global research contributions and study origins using GeoJSON maps.
- Fetches metadata and experiment details using OSDR API (GeneLab, ALSDA, ESA sources).
- 3D anatomical interface built with Three.js, allowing users to explore experiments by body region.
- LLM-generated abstracts highlighting experimental aims, results, and biological insights.
- Summarizes major MeSH terms, genes, and conditions across all studies.

---

## Target Audience and Value

- Quickly identify patterns, gaps, or trends across decades of space biology research.
- Assess biological risks and readiness factors for human spaceflight missions.
- Learn how spaceflight impacts living systems through interactive, visual exploration.

---

## Alignment with Space Apps 2025 Theme

**Learn – Launch – Lead**

* **Learn:** Uses AI and visualization to make NASA’s open data understandable for a broader audience.
* **Launch:** Deploys an interactive, open-source web app powered by OSDR datasets and modern web technologies.
* **Lead:** Provides a foundation for future space biology tools — enabling collaborative discovery and hypothesis generation.

---

## Technical Stack

- HTML5, CSS3, JavaScript (Vite)
- Vis.js (Knowledge Graph), D3.js (Word Cloud), Three.js (3D Human Model), Leaflet.js (Geo Map)
- Python (OpenAI API, OSDR ETL scripts)
- NASA OSDR API, GeneLab, ALSDA, ESA Study Metadata
- OpenAI GPT-4o for classification and summarization
- Vercel (Frontend)

---

## How to Run Locally

```bash
# 1. Clone repository
git clone https://github.com/macaris64/openbio-cosmos.git
cd openbio-cosmos

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open in browser
http://localhost:5173
```

## Impact and Results

* Enables cross-experiment discovery by linking human, plant, and animal studies.
* Supports hypothesis generation for life sciences in space.
* Promotes FAIR data use (Findable, Accessible, Interoperable, Reusable).
* Bridges the gap between raw metadata and actionable biological insights.

---

## References

* [NASA Open Science Data Repository (OSDR)](https://osdr.nasa.gov/bio/)
* [NASA GeneLab](https://genelab.nasa.gov/)
* [NASA Space Life Sciences Library](https://www.nasa.gov/centers/ames/research/space-life-sciences-library/)
* [NASA Task Book](https://taskbook.nasaprs.com/)
* [NASA Space Apps Challenge 2025](https://www.spaceappschallenge.org/2025/challenges/build-a-space-biology-knowledge-engine/)
* [OpenBio Cosmos](https://www.spaceappschallenge.org/2025/find-a-team/habcraft/)

---

## Team

**Team:** OpenBio Cosmos
**Project Lead:** Mehmet Acar
**Focus Areas:** Data Visualization, AI-driven Classification, Bioinformatics Integration

---

> “The cosmos is within us. We are made of star stuff — and now, we’re learning how that star stuff thrives beyond Earth.”
> — Carl Sagan (inspired)
