import { ZONE_LABELS, type Zone } from '../core/math/zones';

const ITEMS: { zone: Zone; text: string }[] = [
  { zone: 'rotation', text: 'cos θ and sin θ, in the plane the rotation turns' },
  { zone: 'scale', text: 'the diagonal' },
  { zone: 'translation', text: 'the fourth column. A rotation or scale about a point other than the origin fills it too' },  { zone: 'linear', text: 'in a product, rotation and scale mix in the top-left 3×3' },
  { zone: 'homogeneous', text: 'always 0 0 0 1' },
];

export function ZoneLegend() {
  return (
    <ul className="zone-legend" aria-label="Matrix zones">
      {ITEMS.map(({ zone, text }) => (
          <li key={zone}>
          <span className={`zone-swatch zone-${zone}`} aria-hidden="true" />
          <span>
            <strong>{ZONE_LABELS[zone]}:</strong> {text}
          </span>
        </li>
      ))}
    </ul>
  );
}