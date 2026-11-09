// x, y, z inputs
import type { Vec3 } from '../core/pipeline/types';
import { NumberField } from './NumberField';

const COMPONENTS = [
  { label: 'x', index: 0 },
  { label: 'y', index: 1 },
  { label: 'z', index: 2 },
] as const;

type Props = {
  value: Vec3;
  step: number;
  onChange: (value: Vec3) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
};
// Shows three(3) number fields for a vector, returns a new vector when one field changes
export function Vec3Fields({ value, step, onChange, onEditStart, onEditEnd }: Props) {
  return (
    <div className="vec3-fields">
      {COMPONENTS.map(({ label, index }) => (
        <NumberField
          key={label}
          label={label}
          className={`axis-${label}`}
          step={step}
          value={value[index]}
          onChange={(n) => onChange(withComponent(value, index, n))}
          onEditStart={onEditStart}
          onEditEnd={onEditEnd}
        />
      ))}
    </div>
  );
}

//  Builds new array instead of changing old one
function withComponent(v: Vec3, index: 0 | 1 | 2, n: number): Vec3 {
  return [index === 0 ? n : v[0], index === 1 ? n : v[1], index === 2 ? n : v[2]];
}