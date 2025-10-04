export function createNavbar() {
  const navbar = document.getElementById("navbar");

  const navInner = document.createElement("div");
  navInner.className = "nav-inner";

  const navLeft = document.createElement("div");
  navLeft.className = "nav-left";

  const logo = document.createElement("img");
  logo.src =
    "https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg";
  logo.alt = "NASA Logo";
  logo.className = "logo";

  logo.addEventListener("click", () => {
    window.location.href = "/";
  });

  const title = document.createElement("span");
  title.className = "app-title";
  title.textContent = "OpenBio Cosmos";

  title.addEventListener("click", () => {
    window.location.href = "/";
  });

  navLeft.appendChild(logo);
  navLeft.appendChild(title);

  const navRight = document.createElement("div");
  navRight.className = "nav-right";

  const navLinks = document.createElement("div");
  navLinks.className = "nav-links";
  navLinks.innerHTML = `
    <a href="/atlas.html">Atlas</a>
    <a href="/articles.html">Articles</a>
    <a href="/experiments.html">Experiments</a>
    <a href="/geo.html" target="_blank">World Map</a>
    <a href="/knowledge-atlas.html" >Knowledge Atlas</a>
  `;

  const themeBtn = document.createElement("button");
  themeBtn.className = "theme-btn";
  themeBtn.textContent = "🌙";

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    themeBtn.textContent = document.body.classList.contains("dark-mode")
      ? "☀️"
      : "🌙";
  });

  const menuBtn = document.createElement("button");
  menuBtn.className = "menu-btn";
  menuBtn.textContent = "☰";

  const menuDropdown = document.createElement("div");
  menuDropdown.className = "menu-dropdown";
  menuDropdown.innerHTML = `
    <a href="/atlas.html">Atlas</a>
    <a href="/articles.html">Articles</a>
    <a href="/experiments.html">Experiments</a>
    <a href="/geo.html" target="_blank">World Map</a>
    <a href="/knowledge-atlas.html">Knowledge Atlas</a>
  `;

  navRight.appendChild(navLinks);
  navRight.appendChild(themeBtn);
  navRight.appendChild(menuBtn);
  navRight.appendChild(menuDropdown);

  navInner.appendChild(navLeft);
  navInner.appendChild(navRight);
  navbar.appendChild(navInner);

  menuBtn.addEventListener("click", () => {
    menuDropdown.classList.toggle("show");
  });

  window.addEventListener("click", (e) => {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.remove("show");
    }
  });

  return navbar;
}
