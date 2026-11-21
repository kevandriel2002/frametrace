import {
  Color,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  type BufferGeometry,
  type Object3D,
} from 'three';
import type { Vec3 } from '../../core/pipeline/types';
import type { DisplayMode } from '../../store/viewStore';

export const EDGE_COLOR = '#1b1e24';

export function part(geometry: BufferGeometry, color: string, display: DisplayMode): Object3D {
  const edges = new EdgesGeometry(geometry);
  if (display === 'wireframe') {
    geometry.dispose();
    const bright = new Color(color).lerp(new Color('#ffffff'), 0.35);
    return new LineSegments(edges, new LineBasicMaterial({ color: bright }));
  }
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color }));
  mesh.add(new LineSegments(edges, new LineBasicMaterial({ color: EDGE_COLOR })));
  return mesh;
}

export function vertexMarkers(points: readonly Vec3[], color: string): Group {
  const group = new Group();
  for (const [x, y, z] of points) {
    const marker = new Mesh(new SphereGeometry(0.05, 12, 8), new MeshBasicMaterial({ color }));
    marker.position.set(x, y, z);
    group.add(marker);
  }
  return group;
}