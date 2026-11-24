import { BoxGeometry, EdgesGeometry, Group, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial } from 'three';
import type { DisplayMode } from '../../store/viewStore';
import { EDGE_COLOR} from './parts';

const FACE_COLORS = ['#d55e00', '#7a3a14', '#009e73', '#0d4f3d', '#56b4e9', '#2a5f80'];

export function createCube(display: DisplayMode): Group {
  const cube = new Group();
  cube.name = 'cube';

  const geometry = new BoxGeometry(1, 1, 1);
  geometry.translate(0.5, 0.5, 0.5);
  const edges = new EdgesGeometry(geometry);

  if (display === 'solid') {
    const mesh = new Mesh(geometry, FACE_COLORS.map((color) => new MeshStandardMaterial({ color })));
    mesh.add(new LineSegments(edges, new LineBasicMaterial({ color: EDGE_COLOR })));
    cube.add(mesh);
  } else {
    geometry.dispose();
    cube.add(new LineSegments(edges, new LineBasicMaterial({ color: '#e6e8ec' })));
  }

  return cube;
}