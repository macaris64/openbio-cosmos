import "./LeftSidebar.css";

import { getCurrentModelId } from "../helpers/ModelLoader.js";

export function createLeftSidebar(jsonPath, onSelectItem) {
  const sidebar = document.createElement("div");
  sidebar.className = "left-sidebar";

  const header = document.createElement("div");
  header.className = "left-sidebar-header";
  header.textContent = "Explorer";
  sidebar.appendChild(header);

  const treeContainer = document.createElement("div");
  treeContainer.className = "tree-container";
  sidebar.appendChild(treeContainer);

  fetch(jsonPath)
    .then((res) => res.json())
    .then((data) => {
      data.forEach((node) => {
        const parent = createFolder(node, onSelectItem);
        treeContainer.appendChild(parent);
      });

      highlightActive(treeContainer, getCurrentModelId());

      const firstLi = treeContainer.querySelector("li");
      if (firstLi) {
        firstLi.classList.add("active");

        const parentUl = firstLi.parentElement;
        if (parentUl && parentUl.classList.contains("file-list")) {
          parentUl.classList.add("open");
        }

        const firstItem = {
          id: firstLi.dataset.modelId,
          name: firstLi.textContent,
          type: "feature",
        };
        onSelectItem(firstItem);
      }
    });

  document.body.appendChild(sidebar);
}

function createFolder(node, onSelectItem) {
  const folderEl = document.createElement("div");
  folderEl.className = "folder";

  const title = document.createElement("div");
  title.className = "folder-title";
  title.textContent = node.name;

  const childrenContainer = document.createElement("ul");
  childrenContainer.className = "file-list";

  if (node.children) {
    node.children.forEach((child) => {
      if (child.type === "model" || child.type === "feature") {
        const li = document.createElement("li");
        li.textContent = child.name;
        li.dataset.modelId = child.id;

        li.addEventListener("click", () => {
          document
            .querySelectorAll(".file-list li.active")
            .forEach((el) => el.classList.remove("active"));

          li.classList.add("active");

          onSelectItem(child);
        });

        childrenContainer.appendChild(li);
      }
    });
  }

  folderEl.appendChild(title);
  folderEl.appendChild(childrenContainer);

  title.addEventListener("click", () => {
    childrenContainer.classList.toggle("open");
  });

  return folderEl;
}

function highlightActive(container, activeId) {
  if (!activeId) return;
  const items = container.querySelectorAll("li");
  items.forEach((li) => {
    if (li.dataset.modelId === activeId) {
      li.classList.add("active");
      li.parentElement.classList.add("open");
    }
  });
}
