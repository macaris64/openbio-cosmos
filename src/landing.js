import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const container = document.getElementById("landing-canvas");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  100,
);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

const loader = new GLTFLoader();
loader.load("/nasa_3d_logo.glb", (gltf) => {
  const model = gltf.scene;
  model.scale.set(0.05, 0.05, 0.05);
  model.rotation.x = Math.PI / 2;
  scene.add(model);

  function animate() {
    requestAnimationFrame(animate);
    model.rotation.x += 0.01;
    renderer.render(scene, camera);
  }
  animate();
});
