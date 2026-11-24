import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  type Line,
  type Sprite,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import type { StoreApi } from 'zustand/vanilla';
import { transformPoints } from '../core/math/points';
import { MODEL_CENTRES } from '../core/models';
import { pivotAt } from '../core/pipeline/pivot';
import { composeAt, effectivePlayhead } from '../core/pipeline/playhead';
import { toPipeline, type PipelineState } from '../store/pipelineStore';
import type { PlaybackState } from '../store/playbackStore';
import type { CameraView, ViewState } from '../store/viewStore';
import { disposeObject } from './dispose';
import { createLocalAxes, type LocalAxes } from './localAxes';
import { createModel } from './models';
import { setOpacity } from './overlay';
import { createPivotMarker } from './pivotMarker';
import { createTether, updateTether } from './tether';
import { createVertexOverlay, type VertexOverlay } from './vertexOverlay';
import { createWorldAxes } from './worldAxes';

export type ViewportStores = {
  pipeline: StoreApi<PipelineState>;
  playback: StoreApi<PlaybackState>;
  view: StoreApi<ViewState>;
};

export class SceneViewport {
  private readonly container: HTMLElement;
  private readonly stores: ViewportStores;
  private readonly renderer: WebGLRenderer;
  private readonly labelRenderer: CSS2DRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly transformed: Group;
  private readonly resizeObserver: ResizeObserver;
  private readonly worldAxes: Group;
  private readonly localAxes: LocalAxes;
  private readonly pivotMarker: Sprite;
  private readonly tether: Line;
  private readonly unsubscribe: () => void;
  private model: Group;
  private vertexOverlay: VertexOverlay;

  constructor(container: HTMLElement, stores: ViewportStores) {
    this.container = container;
    this.stores = stores;

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.className = 'label-layer';
    container.appendChild(this.labelRenderer.domElement);

    this.scene = new Scene();
    this.scene.background = new Color('#14161b');

    this.camera = new PerspectiveCamera(50, 1, 0.1, 200);
    this.camera.position.set(7, 6, 9);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
    this.controls.saveState();

    this.scene.add(new AmbientLight(0xffffff, 0.6));
    const sun = new DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 8, 5);
    this.scene.add(sun);

    const grid = new GridHelper(20, 20, 0x3a3f4b, 0x262a33);
    grid.position.y = -0.001;
    this.scene.add(grid);
    this.worldAxes = createWorldAxes(6);
    this.scene.add(this.worldAxes);

    this.transformed = new Group();
    this.transformed.matrixAutoUpdate = false;
    this.scene.add(this.transformed);

    this.localAxes = createLocalAxes(2.2);
    this.scene.add(this.localAxes.group);

    this.pivotMarker = createPivotMarker();
    this.scene.add(this.pivotMarker);

    this.tether = createTether();
    this.scene.add(this.tether);

    const { model, display, labels } = stores.view.getState();
    this.model = createModel(model, display);
    this.transformed.add(this.model);
    this.vertexOverlay = createVertexOverlay(model, labels);
    this.scene.add(this.vertexOverlay.group);

    this.updateFrameEmphasis();
    this.updateTransform();

    const stops = [
      stores.pipeline.subscribe((state, previous) => {
        if (state.blocks !== previous.blocks) this.updateTransform();
      }),
      stores.playback.subscribe((state, previous) => {
        if (state.playhead !== previous.playhead || state.mode !== previous.mode) this.updateTransform();
        if (state.mode !== previous.mode) this.updateFrameEmphasis();
      }),
      stores.view.subscribe((state, previous) => {
        if (state.model !== previous.model || state.display !== previous.display) this.swapModel();
        if (state.model !== previous.model || state.labels !== previous.labels) {
          this.rebuildVertexOverlay();
          this.updateTransform();
        }
        if (state.cameraRequest && state.cameraRequest !== previous.cameraRequest) {
          this.applyCamera(state.cameraRequest.view);
        }
      }),
    ];
    this.unsubscribe = () => stops.forEach((stop) => stop());

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    this.renderer.setAnimationLoop(() => this.frame());
  }

  private updateTransform(): void {
    const pipeline = toPipeline(this.stores.pipeline.getState().blocks);
    const { playhead, mode } = this.stores.playback.getState();
    const t = effectivePlayhead(playhead, pipeline.length);
    const matrix = composeAt(pipeline, t, mode);

    this.transformed.matrix.copy(matrix);
    this.transformed.matrixWorldNeedsUpdate = true;
    this.localAxes.update(matrix);
    this.vertexOverlay.update(matrix);

    const pivot = pivotAt(pipeline, t, mode);
    this.pivotMarker.position.set(...pivot.world);

    const [centre] = transformPoints(matrix, [MODEL_CENTRES[this.stores.view.getState().model]]);
    const target = centre ?? pivot.world;
    const length = Math.hypot(...target.map((v, i) => v - (pivot.world[i] ?? 0)));
    updateTether(this.tether, pivot.world, target, pivot.kind !== 'translate' && pivot.kind !== null && length > 1e-6);
  }

  private swapModel(): void {
    const { model, display } = this.stores.view.getState();
    this.transformed.remove(this.model);
    disposeObject(this.model);
    this.model = createModel(model, display);
    this.transformed.add(this.model);
  }

  private rebuildVertexOverlay(): void {
    this.vertexOverlay.dispose();
    const { model, labels } = this.stores.view.getState();
    this.vertexOverlay = createVertexOverlay(model, labels);
    this.scene.add(this.vertexOverlay.group);
  }

  private applyCamera(view: CameraView): void {
    if (view === 'reset') {
      this.controls.reset();
      return;
    }
    const target = this.controls.target;
    const distance = this.camera.position.distanceTo(target);
    const direction =
      view === 'front'
        ? new Vector3(0, 0, 1)
        : view === 'right'
          ? new Vector3(1, 0, 0)
          : new Vector3(0, 1, 0.0001).normalize();
    this.camera.position.copy(target).addScaledVector(direction, distance);
    this.controls.update();
  }

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.container;
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private frame(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  private updateFrameEmphasis(): void {
    const world = this.stores.playback.getState().mode === 'world';
    setOpacity(this.worldAxes, world ? 1 : 0.35);
    setOpacity(this.localAxes.group, world ? 0.45 : 1);
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.unsubscribe();
    this.resizeObserver.disconnect();
    this.controls.dispose();
    disposeObject(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labelRenderer.domElement.remove();
  }
}