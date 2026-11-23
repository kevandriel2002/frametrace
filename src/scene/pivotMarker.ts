// Created pivot marker drawn onto a small canvas
import { CanvasTexture, SRGBColorSpace, Sprite, SpriteMaterial } from 'three';

export const PIVOT_COLOR = '#ffd43b';

export function createPivotMarker(): Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not supported');

  const draw = (color: string, width: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(32, 32, 20, 0, Math.PI * 2);
    ctx.moveTo(32, 4);
    ctx.lineTo(32, 60);
    ctx.moveTo(4, 32);
    ctx.lineTo(60, 32);
    ctx.stroke();
  };
  draw('#000000', 9);
  draw(PIVOT_COLOR, 5);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;

  const marker = new Sprite(
    new SpriteMaterial({ map: texture, depthTest: false, sizeAttenuation: false }),
  );
  marker.scale.set(0.045, 0.045, 1);
  marker.renderOrder = 3;
  marker.name = 'pivot-marker';
  return marker;
}