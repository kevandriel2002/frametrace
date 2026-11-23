export type Axis = 'x' | 'y' | 'z';

export type Vec3 = readonly [number, number, number];

export type TranslateOp = {
  readonly kind: 'translate';
  readonly offset: Vec3;
};

export type RotateOp = {
  readonly kind: 'rotate';
  readonly axis: Axis;
  readonly angleDeg: number;
  readonly pivot: Vec3;
};

export type ScaleOp = {
  readonly kind: 'scale';
  readonly factors: Vec3;
  readonly pivot: Vec3;
};

export type Operation = TranslateOp | RotateOp | ScaleOp;

export type Pipeline = readonly Operation[];