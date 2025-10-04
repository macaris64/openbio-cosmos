import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { createLeftSidebar } from "./components/LeftSidebar.js";
import { createNavbar } from "./components/Navbar.js";
import { createSidebar, renderArticles } from "./components/Sidebar.js";
import {
  getCurrentModelId,
  getZonesMeshes,
  loadModel,
} from "./helpers/ModelLoader.js";

createNavbar();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 3, -8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(3, 10, 10);
scene.add(dirLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

const { sidebar, container, header, closeBtn } = createSidebar();

let articlesData = [];
fetch("./data/output_nih.json")
  .then((res) => res.json())
  .then((data) => {
    articlesData = data;
  });

loadModel("/low-poly_male_body.glb", scene, controls, {
  auto_normalize: false,
  modelId: "body",
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
});

createLeftSidebar("./data/atlas.json", (item) => {
  if (item.type === "model") {
    loadModel(item.path, scene, controls, {
      auto_normalize: item.auto_normalize,
      model_scale: item.model_scale,
      modelId: item.id,
      position: item.position,
      rotation: item.rotation,
    });
  }
});

const selectedZones = new Set();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  const zonesMeshes = getZonesMeshes();
  if (!zonesMeshes || zonesMeshes.length === 0) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(zonesMeshes, true);
  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const zoneId = hit.userData.zoneId;

    if (selectedZones.has(zoneId)) selectedZones.delete(zoneId);
    else selectedZones.add(zoneId);

    zonesMeshes.forEach((mesh) => {
      if (selectedZones.has(mesh.userData.zoneId)) {
        mesh.material.opacity = 0.3;
        mesh.material.emissive.setHex(mesh.material.color.getHex());
      } else {
        mesh.material.opacity = 0;
        mesh.material.emissive.setHex(0x000000);
      }
    });

    const filtered = articlesData.filter((a) => selectedZones.has(a.category));
    renderArticles(
      container,
      filtered,
      sidebar,
      header,
      Array.from(selectedZones).join(", "),
      getCurrentModelId(),
    );
  } else {
    const insideSidebar = sidebar.contains(event.target);
    if (!insideSidebar) {
      selectedZones.clear();
      zonesMeshes.forEach((mesh) => {
        mesh.material.opacity = 0;
        mesh.material.emissive.setHex(0x000000);
      });
      sidebar.classList.remove("open");
    }
  }
});

closeBtn.addEventListener("click", () => {
  const zonesMeshes = getZonesMeshes();
  sidebar.classList.remove("open");
  selectedZones.clear();
  zonesMeshes?.forEach((mesh) => {
    mesh.material.opacity = 0;
    mesh.material.emissive.setHex(0x000000);
  });
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
