import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Group,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { disposeObject } from './dispose';
import { createWorldAxes } from './worldAxes';
import type { StoreApi } from 'zustand/vanilla';
import { toPipeline, type PipelineState } from '../store/pipelineStore';
import { createHouse } from './house';
import { createLocalAxes } from './localAxes';
import { composeAt, effectivePlayhead } from '../core/pipeline/playhead';
import type { PlaybackState } from '../store/playbackStore';

export class SceneViewport {
  private readonly container: HTMLElement;
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly resizeObserver: ResizeObserver;
  private readonly house: Group;
  private readonly pipeline: StoreApi<PipelineState>;
  private readonly playback: StoreApi<PlaybackState>;
  private readonly unsubscribe: () => void;

  constructor(container: HTMLElement, pipeline: StoreApi<PipelineState>, playback: StoreApi<PlaybackState>) {
    this.container = container;

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

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
    this.scene.add(createWorldAxes(6));

    this.house = createHouse();
    this.house.matrixAutoUpdate = false;
    this.house.add(createLocalAxes(2.2));
    this.scene.add(this.house);

    this.pipeline = pipeline;
    this.playback = playback;
    this.updateHouse();

    const stopPipeline = pipeline.subscribe((state, previous) => {
      if (state.blocks !== previous.blocks) this.updateHouse();
    });
    const stopPlayback = playback.subscribe((state, previous) => {
      if (state.playhead !== previous.playhead) this.updateHouse();
    });
    this.unsubscribe = () => {
      stopPipeline();
      stopPlayback();
    };

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    this.renderer.setAnimationLoop(() => this.frame());
  }

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.container;
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private frame(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // House depends on two things : blocks and playhead
  // Reads both stores fresh each time
  private updateHouse(): void {
    const pipeline = toPipeline(this.pipeline.getState().blocks);
    const t = effectivePlayhead(this.playback.getState().playhead, pipeline.length);
    this.house.matrix.copy(composeAt(pipeline, t));
    this.house.matrixWorldNeedsUpdate = true;
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.unsubscribe();
    this.resizeObserver.disconnect();
    this.controls.dispose();
    disposeObject(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}