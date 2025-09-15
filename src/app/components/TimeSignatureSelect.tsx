'use client';

import type { ChangeEvent } from 'react';

type SignatureMap = typeof import('@/lib/useMetronome').SIGNATURES;
type TimeSignatureKey = keyof SignatureMap;

const TIME_SIGNATURE_OPTIONS: TimeSignatureKey[] = [
  '2/4',
  '3/4',
  '4/4',
  '6/8',
  '9/8',
  '12/8',
];

interface TimeSignatureSelectProps {
  value: TimeSignatureKey;
  onChange: (signature: TimeSignatureKey) => void;
}

export function TimeSignatureSelect({
  value,
  onChange,
}: TimeSignatureSelectProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as TimeSignatureKey);
  };

  return (
    <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-muted)]">
      <span>Time signature</span>
      <div className="relative flex items-center">
        <select
          aria-label="Time signature"
          value={value}
          onChange={handleChange}
          className="w-full appearance-none rounded-full border border-[color:var(--accent-secondary-soft)] bg-[var(--surface)] px-4 py-3 pr-12 text-left text-sm font-medium tracking-[0.2em] text-[#f5f5f5] transition focus:border-[var(--accent-secondary)] focus:bg-[var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,90,0,0.35)]"
        >
          {TIME_SIGNATURE_OPTIONS.map((option) => (
            <option key={option} value={option} className="text-[#1a1a1a]">
              {option}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]"
        >
          ▾
        </span>
      </div>
    </label>
  );
}
