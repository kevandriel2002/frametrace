import { useRef } from 'react';

export function HelpButton() {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()}>
        Help
      </button>
      <dialog ref={dialog} className="help-dialog" aria-labelledby="help-title">
        <h2 id="help-title">Using FrameTrace</h2>
        <dl>
          <dt>Object</dt>
          <dd>Choose what to transform. The cube, line and plane can show their corner coordinates.</dd>
          <dt>Pipeline</dt>
          <dd>Add translate, rotate and scale steps. Open “About” on a rotate or scale step to choose its pivot. Drag ⠿ or use ↑ ↓ to change their order.</dd>          <dt>Reading</dt>
          <dd>World / Local in the timeline bar. World runs the steps top to bottom about the world axes; Local runs them bottom to top about the object’s own axes. Both end in the same place.</dd>
          <dt>Timeline</dt>
          <dd>Play, scrub or rewind through the steps. Rewind replays backwards; it does not change your pipeline.</dd>
          <dt>Inspector</dt>
          <dd>The current step's matrix and the product so far. Hover a cell to see what it controls.</dd>
        </dl>
        <h3>Keyboard</h3>
        <ul>
          <li>Ctrl+Z: undo · Ctrl+Y or Ctrl+Shift+Z: redo</li>
          <li>Reorder a step: Tab to ⠿, Space to pick up, arrow keys to move, Space to drop</li>
          <li>Esc: close this dialog or the tutorial</li>
        </ul>
        <form method="dialog">
          <button type="submit">Close</button>
        </form>
      </dialog>
    </>
  );
}