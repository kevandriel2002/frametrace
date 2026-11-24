import {
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
  type Object3D,
} from 'three';
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
