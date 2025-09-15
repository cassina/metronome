import { describe, expect, it, vi } from 'vitest';
import { runMetronomeScheduler } from '../src/lib/useMetronome';

describe('runMetronomeScheduler', () => {
  it('reports the downbeat as the first visual beat', () => {
    const beatRef = { current: 0 };
    const nextNoteTime = { current: 0 };
    const ctx = { currentTime: 0 } as unknown as AudioContext;
    const scheduleClick =
      vi.fn<(ctx: AudioContext, time: number, accent: boolean) => void>();
    const onBeat = vi.fn<(beat: number) => void>();
    const pulsesRef = { current: 3 };

    runMetronomeScheduler({
      ctx,
      beatRef,
      nextNoteTime,
      bpm: 120,
      scheduleAhead: 0.1,
      scheduleClickFn: scheduleClick,
      onBeat,
      pulsesRef,
    });

    expect(onBeat).toHaveBeenCalledTimes(1);
    expect(onBeat).toHaveBeenCalledWith(0);
    expect(scheduleClick).toHaveBeenCalledWith(ctx, 0, true);
  });

  it('wraps beats based on the provided pulses', () => {
    const beatRef = { current: 0 };
    const nextNoteTime = { current: 0 };
    const ctx = { currentTime: 0 } as unknown as AudioContext;
    const scheduleClick = vi.fn();
    const pulsesRef = { current: 2 };
    const beats: number[] = [];

    runMetronomeScheduler({
      ctx,
      beatRef,
      nextNoteTime,
      bpm: 60,
      scheduleAhead: 5,
      scheduleClickFn: scheduleClick,
      onBeat: (beat) => {
        beats.push(beat);
      },
      pulsesRef,
    });

    expect(beats).toEqual([0, 1, 0, 1, 0]);
    expect(scheduleClick).toHaveBeenCalledWith(ctx, 0, true);
    expect(scheduleClick).toHaveBeenCalledWith(ctx, expect.any(Number), false);
    expect(beatRef.current).toBe(1);
  });

  it('runs onBeforeSchedule before each downbeat', () => {
    const beatRef = { current: 0 };
    const nextNoteTime = { current: 0 };
    const ctx = { currentTime: 0 } as unknown as AudioContext;
    const scheduleClick = vi.fn();
    const pulsesRef = { current: 2 };
    const onBeforeSchedule = vi.fn();

    runMetronomeScheduler({
      ctx,
      beatRef,
      nextNoteTime,
      bpm: 60,
      scheduleAhead: 5,
      scheduleClickFn: scheduleClick,
      onBeat: () => {
        // intentionally empty
      },
      pulsesRef,
      onBeforeSchedule,
    });

    expect(onBeforeSchedule).toHaveBeenCalledTimes(3);
  });
});
