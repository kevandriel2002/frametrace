import {
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  Vector3,
  type Material,
} from 'three';
import { AXIS_COLORS } from './colors';
import { createLabel } from './labels';

// Draws world axes
const AXES = [
  { name: 'X', direction: new Vector3(1, 0, 0), color: AXIS_COLORS.x },
  { name: 'Y', direction: new Vector3(0, 1, 0), color: AXIS_COLORS.y },
  { name: 'Z', direction: new Vector3(0, 0, 1), color: AXIS_COLORS.z },
];

function segment(from: Vector3, to: Vector3, material: Material): Line {
  const line = new Line(new BufferGeometry().setFromPoints([from, to]), material);
  line.computeLineDistances();
  return line;
}

export function createWorldAxes(length: number): Group {
  const group = new Group();
  group.name = 'world-axes';

  for (const { name, direction, color } of AXES) {
    const positiveEnd = direction.clone().multiplyScalar(length);
    const negativeEnd = positiveEnd.clone().negate();

    group.add(segment(new Vector3(), positiveEnd, new LineBasicMaterial({ color })));
    group.add(
      segment(
        new Vector3(),
        negativeEnd,
        new LineDashedMaterial({ color, dashSize: 0.2, gapSize: 0.15, transparent: true, opacity: 0.6 }),
      ),
    );

    const label = createLabel(name, color);
    label.position.copy(direction).multiplyScalar(length + 0.4);
    group.add(label);
  }

  return group;
}