import { clean } from './matrix';
import type { Vec3 } from '../pipeline/types';

export function formatNumber(value: number, digits = 3): string {
  return String(Number(clean(value).toFixed(digits)));
}

export function formatPoint([x, y, z]: Vec3): string {
  return `(${formatNumber(x)}, ${formatNumber(y)}, ${formatNumber(z)})`;
}