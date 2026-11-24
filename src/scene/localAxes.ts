import { ArrowHelper, Group, Vector3, type Matrix4 } from 'three';
import { localAxisTips } from '../core/math/basis';
import { AXIS_COLORS } from './colors';
import { createLabel } from './labels';
import { drawOnTop } from './overlay';

const AXES = [
  { name: 'x′', direction: new Vector3(1, 0, 0), color: AXIS_COLORS.x },
  { name: 'y′', direction: new Vector3(0, 1, 0), color: AXIS_COLORS.y },
  { name: 'z′', direction: new Vector3(0, 0, 1), color: AXIS_COLORS.z },
];

const HEAD_LENGTH = 0.3;
const HEAD_WIDTH = 0.18;
const LABEL_GAP = 0.3;

export type LocalAxes = { group: Group; update: (matrix: Matrix4) => void };

// Creates local axes
export function createLocalAxes(length: number): LocalAxes {
  const group = new Group();
  group.name = 'local-axes';

  const parts = AXES.map(({ name, direction, color }) => {
    const arrow = new ArrowHelper(direction, new Vector3(), length, color, HEAD_LENGTH, HEAD_WIDTH);
    const label = createLabel(name, color, 0.4);
    group.add(arrow, label);
    return { arrow, label };
  });
  drawOnTop(group, 2);

  const update = (matrix: Matrix4) => {
    const { origin, tips } = localAxisTips(matrix, length);
    const start = new Vector3(...origin);

    parts.forEach(({ arrow, label }, i) => {
      const tip = tips[i];
      const along = tip ? new Vector3(...tip).sub(start) : new Vector3();
      const size = along.length();
      const visible = size > 1e-6;
      arrow.visible = visible;
      label.visible = visible;
      if (!visible) return;

      const direction = along.divideScalar(size);
      arrow.position.copy(start);
      arrow.setDirection(direction);
      arrow.setLength(size, Math.min(HEAD_LENGTH, size * 0.5), Math.min(HEAD_WIDTH, size * 0.3));
      label.position.copy(start).addScaledVector(direction, size + LABEL_GAP);
    });
  };

  return { group, update };
}