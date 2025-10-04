import gsap from "gsap";
import * as THREE from "three";

import { flashAllZones } from "./effectHelpers.js";

export function setupCamera(box, controls, model) {
  const center = new THREE.Vector3();
  box.getCenter(center);

  const size = new THREE.Vector3();
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fitOffset = 1.5;
  const distance = maxDim * fitOffset;

  model.position.sub(center);

  controls.target.copy(center);
  controls.update();

  return new THREE.Vector3(
    center.x,
    center.y + maxDim * 0.2,
    center.z + distance,
  );
}

export function animateCamera(controls, targetPos) {
  gsap.to(controls.object.position, {
    duration: 2,
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    ease: "power2.inOut",
    onStart: () => {
      flashAllZones(1500);
    },
    onUpdate: () => controls.update(),
  });
}
