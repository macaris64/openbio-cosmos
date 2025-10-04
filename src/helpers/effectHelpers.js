import { getZonesMeshes } from "./ModelLoader.js";

/**
 * Flash highlight effect for all zones
 * Shows all zones for given duration, then hides them.
 * @param {number} duration - Duration in milliseconds
 */
export function flashAllZones(duration = 1000) {
  const zonesMeshes = getZonesMeshes();
  if (!zonesMeshes || zonesMeshes.length === 0) return;

  zonesMeshes.forEach((mesh) => {
    mesh.material.opacity = 0.3;
    mesh.material.emissive.setHex(mesh.material.color.getHex());
  });

  setTimeout(() => {
    zonesMeshes.forEach((mesh) => {
      mesh.material.opacity = 0;
      mesh.material.emissive.setHex(0x000000);
    });
  }, duration);
}
