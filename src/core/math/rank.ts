import type { Matrix4 } from 'three';
import { cell } from './matrix';

// Counts how many independent directions the transformation keeps [3, 2, 2, 0]
// Works using Gaussian Elimination
export function linearRank(m: Matrix4, tolerance = 1e-9): number {
  const rows = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cell(m, r, c)));
  let rank = 0;

  for (let col = 0; col < 3 && rank < 3; col++) {
    let pivot = -1;
    let largest = tolerance;
    for (let r = rank; r < 3; r++) {
      const size = Math.abs(rows[r][col]);
      if (size > largest) {
        largest = size;
        pivot = r;
      }
    }
    if (pivot === -1) continue;

    [rows[rank], rows[pivot]] = [rows[pivot], rows[rank]];
    for (let r = rank + 1; r < 3; r++) {
      const factor = rows[r][col] / rows[rank][col];
      for (let c = col; c < 3; c++) rows[r][c] -= factor * rows[rank][c];
    }
    rank++;
  }

  return rank;
}

export function describeRank(rank: number): string {
  switch (rank) {
    case 3:
      return 'keeps all three dimensions';
    case 2:
      return 'flattened onto a plane, cannot be undone';
    case 1:
      return 'collapsed onto a line, cannot be undone';
    default:
      return 'collapsed to a single point, cannot be undone';
  }
}