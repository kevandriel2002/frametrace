import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial } from 'three';
import type { Vec3 } from '../core/pipeline/types';
import { PIVOT_COLOR } from './pivotMarker';

export function createTether(): Line {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(new Float32Array(6), 3));
  const line = new Line(
    geometry,
    new LineBasicMaterial({ color: PIVOT_COLOR, transparent: true, opacity: 0.8, depthTest: false }),
  );
  line.frustumCulled = false;
  line.renderOrder = 3;
  line.name = 'pivot-tether';
  return line;
}

export function updateTether(line: Line, from: Vec3, to: Vec3, visible: boolean): void {
  const position = line.geometry.getAttribute('position');
  position.setXYZ(0, ...from);
  position.setXYZ(1, ...to);
  position.needsUpdate = true;
  line.visible = visible;
}