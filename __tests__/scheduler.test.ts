import { describe, expect, it } from 'vitest';
import { nextNoteTime } from '../src/lib/scheduler';

describe('nextNoteTime', () => {
  it('advances correctly for 120 bpm', () => {
    const bpm = 120;
    let t = 0;
    t = nextNoteTime(t, bpm);
    expect(t).toBeCloseTo(0.5);
    t = nextNoteTime(t, bpm);
    expect(t).toBeCloseTo(1);
  });
});
