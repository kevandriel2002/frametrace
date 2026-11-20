// Shows 4x4 matrix as written in textbooks
import type { Matrix4 } from 'three';
import { formatNumber } from '../core/math/format';
import { toRows } from '../core/math/matrix';

const POSITIONS = [0, 1, 2, 3] as const;

type Props = {
  caption: string;
  matrix: Matrix4;
};

export function MatrixView({ caption, matrix }: Props) {
  const rows = toRows(matrix);
  return (
    <table className="matrix">
      <caption>{caption}</caption>
      <tbody>
        {POSITIONS.map((r) => (
          <tr key={r}>
            {POSITIONS.map((c) => (
              <td key={c} className="matrix-cell">
                {formatNumber(rows[r]?.[c] ?? 0)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}