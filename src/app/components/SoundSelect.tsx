'use client';

const OPTIONS = [
  { key: 'click', label: 'Click' },
  { key: 'wood', label: 'Wood' },
  { key: 'hihat', label: 'Hi-hat' },
] as const;

type SoundKey = (typeof OPTIONS)[number]['key'];

interface Props {
  value: SoundKey;
  onChange: (k: SoundKey) => void;
}

export function SoundSelect({ value, onChange }: Props) {
  return (
    <div className="w-full mt-2">
      <p className="block mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)]">
        Sound
      </p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const selected = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              aria-label={`Sound ${o.label}`}
              aria-pressed={selected}
              onClick={() => onChange(o.key)}
              className={`rounded-full px-3 py-3 text-sm transition-all
                border
                ${
                  selected
                    ? 'bg-[var(--accent-primary)] text-[#0b0b0b] shadow-[var(--glow)] border-transparent'
                    : 'bg-[rgba(255,255,255,0.06)] text-[#f5f5f5] border-[color:var(--accent-secondary-soft)] hover:border-[color:var(--accent-secondary)]'
                }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
