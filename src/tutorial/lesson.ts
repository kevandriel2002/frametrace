import type { Snapshot } from './snapshot';
import { samePoint } from '../core/math/points';
import { playbackStore } from '../store/playbackStore';

export type TutorialStep = {
  id: string;
  title: string;
  body: string;
  target?: string;
  done?: (now: Snapshot) => boolean;
  enter?: () => void;
};

const near = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;

export const LESSON: readonly TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FrameTrace',
    body: 'FrameTrace shows how transformations move an object, one step at a time. In about five minutes you will build a pipeline and find out why the order of steps matters.',
  },
  {
    id: 'scene',
    target: 'viewport',
    title: 'The scene',
    body: 'The coloured lines are the world axes; their dashed halves point the negative way. The x′ y′ z′ arrows belong to the object and move with it. Drag to orbit, scroll to zoom, right-drag to pan. The yellow ring marks the point each step is measured from. Lost? Reset, in the top-right corner, brings the camera back.',
  },
  {
    id: 'clear',
    target: 'pipeline',
    title: 'Start from nothing',
    body: 'Delete every step with its ✕ button. With no steps, the object is untransformed: this is the identity.',
    done: ({ pipeline }) => pipeline.length === 0,
  },
  {
    id: 'translate',
    target: 'add-buttons',
    title: 'Move it',
    body: 'Add a Translate step and set x to 3. The object moves 3 units along the X axis.',
    done: ({ pipeline }) => pipeline.some((op) => op.kind === 'translate' && near(op.offset[0], 3)),
  },
  {
    id: 'rotate',
    target: 'pipeline',
    title: 'Turn it',
    body: 'Add a Rotate step below it, about the Y axis, by 90°. Watch where the object goes: it swings around the world origin, not around itself.',
    done: ({ pipeline }) => {
      const [first, second] = pipeline;
      return (
        pipeline.length === 2 &&
        first?.kind === 'translate' &&
        second?.kind === 'rotate' &&
        second.axis === 'y' &&
        near(second.angleDeg, 90)
      );
    },
  },
  {
    id: 'swap',
    target: 'pipeline',
    title: 'Predict, then swap',
    body: 'Before you touch anything: if the rotation happened first, where would the object end up? Now drag Rotate above Translate (use ⠿, or the ↑ button) and check your prediction.',
    done: ({ pipeline }) => pipeline[0]?.kind === 'rotate' && pipeline[1]?.kind === 'translate',
  },
  {
    id: 'timeline',
    target: 'timeline',
    title: 'Watch it step by step',
    body: 'Press Play, or drag the slider. The step being applied is highlighted in the list, and later steps are dimmed.',
    done: ({ playhead }) => playhead !== null,
  },
  {
    id: 'frames',
    target: 'frame-toggle',
    title: 'Why two readings?',
    body: 'World is like directions by compass: “go 3 km east, then face north”. North never moves. Local is like directions to a walker: “walk 3 steps forward, then turn left”. Each instruction depends on where they face now.',
  },
  {
    id: 'local',
    target: 'frame-toggle',
    title: 'Try the local reading',
    body: 'Predict first: in Local, which step runs first? Then switch to Local here and press Play. The path changes; the end position does not.',
    done: ({ mode, playing }) => mode === 'local' && playing,
  },
  {
    id: 'rewind',
    target: 'timeline',
    title: 'Rewind is not Undo',
    body: 'Press Rewind to play the steps backwards to the start. Undo (Ctrl+Z) would change your pipeline instead; Rewind only replays it.',
    done: ({ playhead }) => playhead === 0,
  },
  {
    id: 'inspector',
    target: 'inspector',
    title: 'The numbers behind it',
    body: 'The inspector shows the numbers. In the product, the fourth column holds the translation. Can you find the 3?',
    enter: () => playbackStore.getState().jumpToEnd(),
  },
  {
    id: 'cube',
    target: 'object-picker',
    title: 'Follow a corner',
    body: 'Switch the object to Cube. Its labelled corner shows coordinates that change as the steps play.',
    done: ({ model }) => model === 'cube',
  },
  {
    id: 'pivot',
    target: 'pipeline',
    title: 'Turn it in place',
    body: 'On the Rotate step, open “About” and choose Object centre, then press Play. The cube now turns around its own centre instead of swinging around a corner. The yellow ring shows the point it turns about.',
    done: ({ pipeline }) =>
      pipeline.some((op) => op.kind === 'rotate' && samePoint(op.pivot, [0.5, 0.5, 0.5])),
  },
  {
    id: 'finish',
    title: 'You are ready',
    body: 'Try your own pipelines. You can replay this tutorial at any time with the Tutorial button.',
  },
];