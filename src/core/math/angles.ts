/** Degrees are used in the UI, radians internally (see docs/CONVENTIONS.md). */
export const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export const toDegrees = (radians: number): number => (radians * 180) / Math.PI;