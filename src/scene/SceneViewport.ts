import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  type Matrix4,
  type Sprite,
  type Line,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import type { StoreApi } from 'zustand/vanilla';
import { formatPoint } from '../core/math/format';
import { transformPoints } from '../core/math/points';
import { HIGHLIGHTED_VERTEX, MODEL_VERTICES } from '../core/models';
import { composeAt, effectivePlayhead } from '../core/pipeline/playhead';
import { toPipeline, type PipelineState } from '../store/pipelineStore';
import type { PlaybackState } from '../store/playbackStore';
import type { ViewState } from '../store/viewStore';
import { disposeObject } from './dispose';
import { createLocalAxes } from './localAxes';
import { createModel } from './models';
import { createWorldAxes } from './worldAxes';
import { pivotAt } from '../core/pipeline/pivot';
import { setOpacity } from './overlay';
import { createPivotMarker } from './pivotMarker';
import { createTether, updateTether } from './tether';
import { MODEL_CENTRES } from '../core/models';

export type ViewportStores = {
  pipeline: StoreApi<PipelineState>;
  playback: StoreApi<PlaybackState>;
  view: StoreApi<ViewState>;
};

type Label = { object: CSS2DObject; vertexIndex: number };

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
  private readonly localAxes: Group;
  private readonly pivotMarker: Sprite;
  private readonly tether: Line;
  private readonly unsubscribe: () => void;
  private model: Group;
  private labels: Label[] = [];

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
    this.localAxes = createLocalAxes(2.2);
    this.transformed.add(this.localAxes);
    this.scene.add(this.transformed);
    
    this.pivotMarker = createPivotMarker();
    this.scene.add(this.pivotMarker);

    this.tether = createTether();
    this.scene.add(this.tether);

    const { model, display } = stores.view.getState();
    this.model = createModel(model, display);
    this.transformed.add(this.model);
    this.rebuildLabels();
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
          this.rebuildLabels();
          this.updateTransform();
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
    this.updateLabelText(matrix);

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

  private rebuildLabels(): void {
    for (const { object } of this.labels) this.transformed.remove(object);

    const { model, labels } = this.stores.view.getState();
    const vertices = MODEL_VERTICES[model];
    const highlighted = HIGHLIGHTED_VERTEX[model];
    const indices =
      labels === 'all'
        ? vertices.map((_, i) => i)
        : labels === 'one' && highlighted !== null
          ? [highlighted]
          : [];

    this.labels = indices.flatMap((vertexIndex) => {
      const vertex = vertices[vertexIndex];
      if (!vertex) return [];
      const element = document.createElement('div');
      element.className = 'vertex-label';
      const object = new CSS2DObject(element);
      object.position.set(...vertex);
      object.center.set(-0.1, 1.1);
      this.transformed.add(object);
      return [{ object, vertexIndex }];
    });
  }

  private updateLabelText(matrix: Matrix4): void {
    const { model } = this.stores.view.getState();
    const moved = transformPoints(matrix, MODEL_VERTICES[model]);
    for (const { object, vertexIndex } of this.labels) {
      const point = moved[vertexIndex];
      if (point) object.element.textContent = formatPoint(point);
    }
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
    setOpacity(this.localAxes, world ? 0.45 : 1);
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