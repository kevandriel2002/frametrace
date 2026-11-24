import { Group, Mesh, MeshBasicMaterial, SphereGeometry, type Matrix4 } from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { formatPoint } from '../core/math/format';
import { transformPoints } from '../core/math/points';
import { HIGHLIGHTED_VERTEX, MODEL_VERTICES, type ModelKind } from '../core/models';
import type { LabelMode } from '../store/viewStore';
import { disposeObject } from './dispose';

// Markers and corner labels
export type VertexOverlay = {
  group: Group;
  update: (matrix: Matrix4) => void;
  dispose: () => void;
};

export function createVertexOverlay(model: ModelKind, labels: LabelMode): VertexOverlay {
  const group = new Group();
  group.name = 'vertex-overlay';
  const vertices = MODEL_VERTICES[model];
  const highlighted = HIGHLIGHTED_VERTEX[model];

  const markers = vertices.map((_, i) => {
    const marker = new Mesh(
      new SphereGeometry(i === highlighted ? 0.06 : 0.045, 12, 8),
      new MeshBasicMaterial({ color: i === highlighted ? '#ffffff' : '#c9ccd3' }),
    );
    group.add(marker);
    return marker;
  });

  const labelled =
    labels === 'all'
      ? vertices.map((_, i) => i)
      : labels === 'one' && highlighted !== null
        ? [highlighted]
        : [];

  const tags = labelled.map((vertexIndex) => {
    const element = document.createElement('div');
    element.className = 'vertex-label';
    const object = new CSS2DObject(element);
    object.center.set(-0.1, 1.1);
    group.add(object);
    return { object, vertexIndex };
  });

  const update = (matrix: Matrix4) => {
    const moved = transformPoints(matrix, vertices);
    markers.forEach((marker, i) => {
      const point = moved[i];
      if (point) marker.position.set(...point);
    });
    for (const { object, vertexIndex } of tags) {
      const point = moved[vertexIndex];
      if (!point) continue;
      object.position.set(...point);
      object.element.textContent = formatPoint(point);
    }
  };

  const dispose = () => {
    for (const { object } of tags) object.removeFromParent();
    group.removeFromParent();
    disposeObject(group);
  };

  return { group, update, dispose };
}