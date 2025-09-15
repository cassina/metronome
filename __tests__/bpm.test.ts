import { describe, expect, it } from 'vitest';
import { bpmToMs } from '../src/lib/bpm';

describe('bpmToMs', () => {
  it('converts 60 bpm to 1000ms', () => {
    expect(bpmToMs(60)).toBe(1000);
  });

  it('throws on non-positive bpm', () => {
    expect(() => bpmToMs(0)).toThrow();
  });
});
