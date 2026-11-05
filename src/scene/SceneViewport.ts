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
import { composePipeline } from '../core/pipeline/compose';
import { rotate, scale, translate } from '../core/pipeline/operations';
import type { Pipeline } from '../core/pipeline/types';
import { createHouse } from './house';
import { createLocalAxes } from './localAxes';

export class SceneViewport {
  private readonly container: HTMLElement;
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly resizeObserver: ResizeObserver;
  private readonly house: Group;

  constructor(container: HTMLElement) {
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

    this.applyPipeline([scale(1, 1.5, 1), rotate('y', 45), translate(3, 0, 0)]);

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

  private applyPipeline(pipeline: Pipeline): void {
  this.house.matrix.copy(composePipeline(pipeline));
  this.house.matrixWorldNeedsUpdate = true;
  }

  dispose(): void {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    disposeObject(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}