import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { animateCamera, setupCamera } from "./cameraHelpers.js";
import { renderZones } from "./renderZones.js";

let currentModel = null;
let currentModelId = null;
let zonesMeshes = [];
const loader = new GLTFLoader();

let loadRequestId = 0;

function disposeModel(model, scene) {
  if (!model) return;
  model.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose && m.dispose());
        } else {
          child.material.dispose && child.material.dispose();
        }
      }
    }
  });
  scene.remove(model);
}

export function loadModel(path, scene, controls, options = {}) {
  const requestId = ++loadRequestId;

  if (currentModel) {
    disposeModel(currentModel, scene);
    zonesMeshes = [];
    currentModel = null;
  }

  loader.load(
    path,
    (gltf) => {
      if (requestId !== loadRequestId) {
        console.warn("Stale model load ignored:", path);
        disposeModel(gltf.scene, scene);
        return;
      }

      currentModel = gltf.scene;
      currentModelId = options.modelId || null;

      currentModel.scale.setScalar(options.model_scale || 1);

      if (options.position) {
        currentModel.position.set(
          options.position.x || 0,
          options.position.y || 0,
          options.position.z || 0,
        );
      }

      if (options.rotation) {
        currentModel.rotation.set(
          options.rotation.x || 0,
          options.rotation.y || 0,
          options.rotation.z || 0,
        );
      }

      if (options.auto_normalize) {
        const box = new THREE.Box3().setFromObject(currentModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const normalizeScale = 2 / maxDim;
        currentModel.scale.multiplyScalar(normalizeScale);
      }

      if (options.model_scale) {
        currentModel.scale.multiplyScalar(options.model_scale);
      }

      scene.add(currentModel);

      const box = new THREE.Box3().setFromObject(currentModel);
      const size = new THREE.Vector3();
      box.getSize(size);

      const targetPos = setupCamera(box, controls, currentModel);
      zonesMeshes = renderZones(currentModel, size, options.modelId);

      animateCamera(controls, targetPos);
    },
    () => {},
    (err) => console.error("Model yükleme hatası:", err),
  );
}

export function getZonesMeshes() {
  return zonesMeshes;
}

export function getCurrentModel() {
  return currentModel;
}

export function getCurrentModelId() {
  return currentModelId;
}
