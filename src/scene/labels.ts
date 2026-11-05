import { CanvasTexture, SRGBColorSpace, Sprite, SpriteMaterial } from 'three';

// Defines text labels for each axis
export function createLabel(text: string, color: string, size = 0.5): Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not supported');

  ctx.font = 'bold 84px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(text, 64, 64);
  ctx.fillStyle = color;
  ctx.fillText(text, 64, 64);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;

  const sprite = new Sprite(new SpriteMaterial({ map: texture, depthTest: false }));
  sprite.scale.set(size, size, 1);
  sprite.renderOrder = 1;
  return sprite;
}