import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import { scheduleClick } from './audio';

const LOOK_AHEAD = 25; // ms
const SCHEDULE_AHEAD = 0.1; // seconds
const BEATS_PER_MEASURE = 3;

type ScheduleFn = (ctx: AudioContext, time: number, accent: boolean) => void;

interface SchedulerOptions {
  ctx: AudioContext;
  beatRef: MutableRefObject<number>;
  nextNoteTime: MutableRefObject<number>;
  bpm: number;
  scheduleAhead: number;
  scheduleClickFn: ScheduleFn;
  onBeat: (beat: number) => void;
}

export function runMetronomeScheduler({
  ctx,
  beatRef,
  nextNoteTime,
  bpm,
  scheduleAhead,
  scheduleClickFn,
  onBeat,
}: SchedulerOptions) {
  if (bpm <= 0) return;

  while (nextNoteTime.current < ctx.currentTime + scheduleAhead) {
    const beat = beatRef.current;
    const isDownBeat = beat === 0;

    scheduleClickFn(ctx, nextNoteTime.current, isDownBeat);
    onBeat(beat);

    nextNoteTime.current += 60 / bpm;
    beatRef.current = (beat + 1) % BEATS_PER_MEASURE;
  }
}

export function useMetronome(initialBpm = 120) {
  const [bpm, setBpmState] = useState(initialBpm);
  const bpmRef = useRef(bpm);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const beatRef = useRef(0);
  const nextNoteTime = useRef(0);
  const timer = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    bpmRef.current = bpm;
    localStorage.setItem('last-bpm', String(bpm));
  }, [bpm]);

  useEffect(() => {
    const stored = localStorage.getItem('last-bpm');
    if (stored) {
      const val = parseInt(stored, 10);
      if (!Number.isNaN(val)) setBpmState(val);
    }
  }, []);

  function init() {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
  }

  function scheduler() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    runMetronomeScheduler({
      ctx,
      beatRef,
      nextNoteTime,
      bpm: bpmRef.current,
      scheduleAhead: SCHEDULE_AHEAD,
      scheduleClickFn: scheduleClick,
      onBeat: setCurrentBeat,
    });
  }

  function start() {
    if (isRunning || bpmRef.current <= 0) return;
    init();
    const ctx = ctxRef.current;
    if (!ctx) return;
    nextNoteTime.current = ctx.currentTime;
    setIsRunning(true);
    scheduler();
    timer.current = window.setInterval(scheduler, LOOK_AHEAD);
  }

  function stop() {
    if (!isRunning) return;
    window.clearInterval(timer.current);
    setIsRunning(false);
    setCurrentBeat(-1);
    beatRef.current = 0;
  }

  function setBpm(value: number) {
    const clamped = Math.max(0, Math.min(400, value));
    setBpmState(clamped);
    if (clamped === 0) stop();
  }

  return { bpm, setBpm, start, stop, isRunning, currentBeat };
}
