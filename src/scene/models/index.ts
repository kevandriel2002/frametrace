// builds any object
import type { Group } from 'three';
import type { ModelKind } from '../../core/models';
import type { DisplayMode } from '../../store/viewStore';
import { createCube } from './cube';
import { createHouse } from './house';
import { createPlane } from './plane';
import { createSegment } from './segment';

export function createModel(kind: ModelKind, display: DisplayMode): Group {
  switch (kind) {
    case 'house':
      return createHouse(display);
    case 'cube':
      return createCube(display);
    case 'segment':
      return createSegment();
    case 'plane':
      return createPlane(display);
  }
}