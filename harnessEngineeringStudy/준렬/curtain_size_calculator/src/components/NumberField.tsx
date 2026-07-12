import { useEffect, useState } from 'react';
import { TextField } from '@toss/tds-mobile';

type NumberFieldProps = {
  label: string;
  value: number;
  suffix: string;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
};

export function NumberField({ label, value, suffix, min = 0, step = 1, onChange }: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <TextField
      variant="box"
      label={label}
      labelOption="sustain"
      type="number"
      inputMode="decimal"
      min={min}
      step={step}
      value={draft}
      suffix={suffix}
      onChange={event => {
        const nextDraft = event.currentTarget.value;
        setDraft(nextDraft);

        if (nextDraft === '') {
          return;
        }

        const nextValue = Number(nextDraft);
        if (Number.isFinite(nextValue)) {
          onChange(Math.max(min, nextValue));
        }
      }}
      onBlur={() => {
        if (draft === '') {
          setDraft(String(min));
          onChange(min);
        }
      }}
    />
  );
}
