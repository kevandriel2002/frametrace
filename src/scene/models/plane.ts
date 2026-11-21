import {
  BackSide,
  EdgesGeometry,
  FrontSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';
import { MODEL_VERTICES } from '../../core/models';
import type { DisplayMode } from '../../store/viewStore';
import { vertexMarkers } from './parts';

export function createPlane(display: DisplayMode): Group {
  const plane = new Group();
  plane.name = 'plane';

  const geometry = new PlaneGeometry(1, 1);
  geometry.translate(0.5, 0.5, 0);
  const edges = new EdgesGeometry(geometry);

  if (display === 'solid') {
    plane.add(new Mesh(geometry, new MeshStandardMaterial({ color: '#7aa2ff', side: FrontSide })));
    plane.add(new Mesh(geometry, new MeshStandardMaterial({ color: '#c792ea', side: BackSide })));
  } else {
    geometry.dispose();
  }

  plane.add(new LineSegments(edges, new LineBasicMaterial({ color: '#e6e8ec' })));
  plane.add(vertexMarkers(MODEL_VERTICES.plane, '#f5f5f5'));
  return plane;
}