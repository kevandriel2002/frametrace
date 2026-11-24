import { createStore } from 'zustand/vanilla';
import type { ModelKind } from '../core/models';

export type DisplayMode = 'solid' | 'wireframe';
export type LabelMode = 'none' | 'one' | 'all';
export type CameraView = 'reset' | 'front' | 'right' | 'top';

export type ViewState = {
  model: ModelKind;
  display: DisplayMode;
  labels: LabelMode;
  setModel: (model: ModelKind) => void;
  setDisplay: (display: DisplayMode) => void;
  setLabels: (labels: LabelMode) => void;
  cameraRequest: { view: CameraView } | null;
  requestCamera: (view: CameraView) => void;
};

export const viewStore = createStore<ViewState>()((set) => ({
  model: 'house',
  display: 'solid',
  labels: 'one',
  setModel: (model) => set({ model }),
  setDisplay: (display) => set({ display }),
  setLabels: (labels) => set({ labels }),
  cameraRequest: null,
  requestCamera: (view) => set({ cameraRequest: { view } }),
}));