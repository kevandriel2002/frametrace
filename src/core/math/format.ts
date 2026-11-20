import { clean } from './matrix';

export function formatNumber(value: number, digits = 3): string {
  return String(Number(clean(value).toFixed(digits)));
}
