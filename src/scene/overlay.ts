import { Line, Mesh, Sprite, type Material, type Object3D } from 'three';

// Draw gizmo on top of geometry
export function drawOnTop(root: Object3D, renderOrder = 2): void {
  root.traverse((object) => {
    if (object instanceof Mesh || object instanceof Line || object instanceof Sprite) {
      const materials: Material[] = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials) material.depthTest = false;
      object.renderOrder = renderOrder;
    }
  });
}