import * as THREE from "three";

import { zonesConfig } from "../zones/zonesConfig.js";

function makeMaterial(zone) {
  return new THREE.MeshStandardMaterial({
    color: zone.color,
    transparent: true,
    opacity: 0,
    emissive: 0x000000,
    emissiveIntensity: 0.6,
  });
}

function computeDims(size, zone, scaleFactor) {
  return {
    height: size.y * (zone.height || 0) * scaleFactor,
    width: size.x * (zone.width || 0) * scaleFactor,
    depth: size.z * (zone.depth || 0) * scaleFactor,
  };
}

function computeCenterY(zone, refs, size, height) {
  let centerY = 0;

  if (zone.anchor === "top") {
    centerY = size.y / 2 - height / 2;
  } else if (zone.anchor?.startsWith("below:")) {
    const key = zone.anchor.split(":")[1];
    const ref = refs[key];
    const gap = size.y * (zone.gap || 0);
    centerY = ref.centerY - ref.height / 2 - gap - height / 2;
  } else if (zone.anchor?.startsWith("between:")) {
    const [, ref1Key, ref2Key] = zone.anchor.split(":");
    const r1 = refs[ref1Key];
    const r2 = refs[ref2Key];
    const topY = r1.centerY + r1.height / 2;
    const bottomY = r2.centerY - r2.height / 2;

    const betweenHeight = topY - bottomY;
    const betweenCenter = (topY + bottomY) / 2;

    return { centerY: betweenCenter, overrideHeight: betweenHeight };
  } else if (zone.anchor === "chest") {
    const ref = refs["chest"];
    centerY = ref.centerY + (zone.yOffset ? size.y * zone.yOffset : 0);
  }

  return { centerY, overrideHeight: null };
}

function addZoneMeshes(model, zone, dims, centerY, mat, sizeX) {
  const meshes = [];
  const geo = new THREE.BoxGeometry(dims.width, dims.height, dims.depth);

  const offsetX = zone.offset?.[0] || 0;
  const offsetY = zone.offset?.[1] || 0;
  const offsetZ = zone.offset?.[2] || 0;

  if (zone.type === "double") {
    const baseOffsetX = sizeX * (zone.xOffset || 0);

    const left = new THREE.Mesh(geo, mat.clone());
    left.position.set(-baseOffsetX + offsetX, centerY + offsetY, offsetZ);
    if (zone.rotation) left.rotation.z = -zone.rotation;
    left.userData.zoneId = zone.id;
    model.add(left);
    meshes.push(left);

    const right = new THREE.Mesh(geo.clone(), mat.clone());
    right.position.set(baseOffsetX + offsetX, centerY + offsetY, offsetZ);
    if (zone.rotation) right.rotation.z = zone.rotation;
    right.userData.zoneId = zone.id;
    model.add(right);
    meshes.push(right);
  } else {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(offsetX, centerY + offsetY, offsetZ);
    mesh.userData.zoneId = zone.id;
    model.add(mesh);
    meshes.push(mesh);
  }

  return meshes;
}

export function renderZones(model, size, modelId) {
  const refs = {};
  const allZones = [];

  const config = zonesConfig[modelId] || {};
  const scaleFactor = config.scale || 1;
  const yOffsetGlobal = config.yOffsetGlobal || 0;
  const zones = config.zones || [];

  zones.forEach((zone) => {
    const mat = makeMaterial(zone);
    let { height, width, depth } = computeDims(size, zone, scaleFactor);

    const centerInfo = computeCenterY(zone, refs, size, height);
    if (centerInfo.overrideHeight != null) {
      height = centerInfo.overrideHeight;
    }
    let centerY = centerInfo.centerY;

    centerY += size.y * yOffsetGlobal;

    const meshes = addZoneMeshes(
      model,
      zone,
      { width, height, depth },
      centerY,
      mat,
      size.x,
    );
    allZones.push(...meshes);

    refs[zone.id] = { centerY, height };
  });

  return allZones;
}
