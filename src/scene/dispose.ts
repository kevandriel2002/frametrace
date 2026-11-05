import { Line, Mesh, Sprite, type Material, type Object3D } from 'three';

// Clean up GPU memory by disposing
function disposeMaterial(material: Material | Material[]): void {
  const materials = Array.isArray(material) ? material : [material];
  for (const m of materials) m.dispose();
}

export function disposeObject(root: Object3D): void {
  root.traverse((object) => {
    if (object instanceof Mesh || object instanceof Line) {
      object.geometry.dispose();
      disposeMaterial(object.material);
    } else if (object instanceof Sprite) {
      object.material.map?.dispose();
      object.material.dispose();
    }
  });
}