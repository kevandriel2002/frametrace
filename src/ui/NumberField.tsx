// Number input that handles typing
import { useState } from 'react';

type Props = {
  label: string;
  value: number;
  step: number;
  className?: string;
  onChange: (value: number) => void;
  onEditStart: () => void;
  onEditEnd: () => void;
};

export function NumberField({
  label,
  value,
  step,
  className,
  onChange,
  onEditStart,
  onEditEnd,
}: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <label className={`number-field ${className ?? ''}`}>
      <span className="number-field-label">{label}</span>
      <input
        type="number"
        step={step}
        value={draft ?? String(value)}
        onFocus={() => {
          setDraft(String(value));
          onEditStart();
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          const parsed = event.target.valueAsNumber;
          if (Number.isFinite(parsed)) onChange(parsed);
        }}
        onBlur={() => {
          setDraft(null);
          onEditEnd();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
      />
    </label>
  );
}