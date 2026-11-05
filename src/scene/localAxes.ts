import { ArrowHelper, Group, Vector3 } from 'three';
import { AXIS_COLORS } from './colors';
import { createLabel } from './labels';
import { drawOnTop } from './overlay';

// Create local axes
const AXES = [
  { name: 'x′', direction: new Vector3(1, 0, 0), color: AXIS_COLORS.x },
  { name: 'y′', direction: new Vector3(0, 1, 0), color: AXIS_COLORS.y },
  { name: 'z′', direction: new Vector3(0, 0, 1), color: AXIS_COLORS.z },
];

export function createLocalAxes(length: number): Group {
  const group = new Group();
  group.name = 'local-axes';

  for (const { name, direction, color } of AXES) {
    group.add(new ArrowHelper(direction, new Vector3(), length, color, 0.3, 0.18));

    const label = createLabel(name, color, 0.4);
    label.position.copy(direction).multiplyScalar(length + 0.3);
    group.add(label);
  }

  drawOnTop(group, 2);
  return group;
}