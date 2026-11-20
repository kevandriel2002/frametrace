// Shows 4x4 matrix as written in textbooks
import type { Matrix4 } from 'three';
import { formatNumber } from '../core/math/format';
import { toRows } from '../core/math/matrix';
import { cellZone, ZONE_LABELS } from '../core/math/zones';
import type { Operation } from '../core/pipeline/types';

const POSITIONS = [0, 1, 2, 3] as const;

type Props = {
  caption: string;
  matrix: Matrix4;
  zoneOp: Operation | null;
  text?: string[][] | null;
};

export function MatrixView({ caption, matrix, zoneOp, text }: Props) {
  const rows = toRows(matrix);
  return (
    <table className="matrix">
      <caption>{caption}</caption>
      <tbody>
        {POSITIONS.map((r) => (
          <tr key={r}>
            {POSITIONS.map((c) => {
              const zone = cellZone(r, c, zoneOp);
              const label = `${ZONE_LABELS[zone]}, row ${r + 1}, column ${c + 1}`;
              return (
                <td key={c} className={`matrix-cell zone-${zone}`} title={label} aria-label={label}>
                  {text?.[r]?.[c] ?? formatNumber(rows[r]?.[c] ?? 0)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}