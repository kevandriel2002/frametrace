import { BufferGeometry, Group, Line, LineBasicMaterial, Vector3 } from 'three';
import { MODEL_VERTICES } from '../../core/models';

export function createSegment(): Group {
  const segment = new Group();
  segment.name = 'segment';
  const points = MODEL_VERTICES.segment.map(([x, y, z]) => new Vector3(x, y, z));
  segment.add(new Line(new BufferGeometry().setFromPoints(points), new LineBasicMaterial({ color: '#e6a700' })));
  return segment;
}