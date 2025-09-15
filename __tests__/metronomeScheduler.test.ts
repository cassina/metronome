import { describe, expect, it, vi } from "vitest";
import { runMetronomeScheduler } from "../src/lib/useMetronome";

describe("runMetronomeScheduler", () => {
  it("reports the downbeat as the first visual beat", () => {
    const beatRef = { current: 0 };
    const nextNoteTime = { current: 0 };
    const ctx = { currentTime: 0 } as unknown as AudioContext;
    const scheduleClick =
      vi.fn<(ctx: AudioContext, time: number, accent: boolean) => void>();
    const onBeat = vi.fn<(beat: number) => void>();

    runMetronomeScheduler({
      ctx,
      beatRef,
      nextNoteTime,
      bpm: 120,
      scheduleAhead: 0.1,
      scheduleClickFn: scheduleClick,
      onBeat,
    });

    expect(onBeat).toHaveBeenCalledTimes(1);
    expect(onBeat).toHaveBeenCalledWith(0);
    expect(scheduleClick).toHaveBeenCalledWith(ctx, 0, true);
  });
});
