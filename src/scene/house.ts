import {
  BoxGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  type BufferGeometry,
} from 'three';

// Builds house from five parts: Body, Roof, Chimney, Door, and Window
function part(geometry: BufferGeometry, color: string, x: number, y: number, z: number): Mesh {
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color }));
  mesh.position.set(x, y, z);
  return mesh;
}

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

export function createHouse(): Group {
  const house = new Group();
  house.name = 'house';

  house.add(part(new BoxGeometry(2, 1.2, 1.5), '#d9c7a7', 0, 0.6, 0));
  house.add(part(roofGeometry(2.2, 0.8, 1.7), '#8c3b2e', 0, 1.2, 0));
  house.add(part(new BoxGeometry(0.25, 0.6, 0.25), '#6b6b6b', 0.6, 1.7, -0.3));
  house.add(part(new BoxGeometry(0.4, 0.7, 0.05), '#4a3424', -0.5, 0.35, 0.775));
  house.add(part(new BoxGeometry(0.05, 0.4, 0.4), '#9fd3ff', 1.025, 0.7, 0.2));

  return house;
}