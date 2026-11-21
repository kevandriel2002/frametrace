import { BoxGeometry, ExtrudeGeometry, Group, Shape, type BufferGeometry } from 'three';
import type { DisplayMode } from '../../store/viewStore';
import { part } from './parts';

function roofGeometry(width: number, height: number, depth: number): ExtrudeGeometry {
  const shape = new Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(0, height);
  shape.closePath();

  const geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

export function createHouse(display: DisplayMode): Group {
  const house = new Group();
  house.name = 'house';

  const add = (geometry: BufferGeometry, color: string, x: number, y: number, z: number) => {
    const piece = part(geometry, color, display);
    piece.position.set(x, y, z);
    house.add(piece);
  };

  add(new BoxGeometry(2, 1.2, 1.5), '#d9c7a7', 0, 0.6, 0);
  add(roofGeometry(2.2, 0.8, 1.7), '#8c3b2e', 0, 1.2, 0);
  add(new BoxGeometry(0.25, 0.6, 0.25), '#6b6b6b', 0.6, 1.7, -0.3);
  add(new BoxGeometry(0.4, 0.7, 0.05), '#4a3424', -0.5, 0.35, 0.775);
  add(new BoxGeometry(0.05, 0.4, 0.4), '#9fd3ff', 1.025, 0.7, 0.2);

  return house;
}