// catch square roots and return exact form
import type { Axis } from '../pipeline/types';

const EXACT = new Map<number, readonly [string, string]>([
  [0, ['1', '0']],
  [30, ['√3/2', '1/2']],
  [45, ['√2/2', '√2/2']],
  [60, ['1/2', '√3/2']],
  [90, ['0', '1']],
  [120, ['-1/2', '√3/2']],
  [135, ['-√2/2', '√2/2']],
  [150, ['-√3/2', '1/2']],
  [180, ['-1', '0']],
  [210, ['-√3/2', '-1/2']],
  [225, ['-√2/2', '-√2/2']],
  [240, ['-1/2', '-√3/2']],
  [270, ['0', '-1']],
  [300, ['1/2', '-√3/2']],
  [315, ['√2/2', '-√2/2']],
  [330, ['√3/2', '-1/2']],
]);

const negate = (s: string): string => (s === '0' ? '0' : s.startsWith('-') ? s.slice(1) : `-${s}`);

export function exactCosSin(angleDeg: number): readonly [string, string] | null {
  if (!Number.isInteger(angleDeg)) return null;
  return EXACT.get(((angleDeg % 360) + 360) % 360) ?? null;
}

export function exactRotationRows(axis: Axis, angleDeg: number): string[][] | null {
  const exact = exactCosSin(angleDeg);
  if (!exact) return null;
  const [c, s] = exact;
  const ns = negate(s);

  switch (axis) {
    case 'x':
      return [['1', '0', '0', '0'], ['0', c, ns, '0'], ['0', s, c, '0'], ['0', '0', '0', '1']];
    case 'y':
      return [[c, '0', s, '0'], ['0', '1', '0', '0'], [ns, '0', c, '0'], ['0', '0', '0', '1']];
    case 'z':
      return [[c, ns, '0', '0'], [s, c, '0', '0'], ['0', '0', '1', '0'], ['0', '0', '0', '1']];
  }
}