import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import { scheduleClick } from './audio';

const LOOK_AHEAD = 25; // ms
const SCHEDULE_AHEAD = 0.1; // seconds

export const SIGNATURES = {
  '2/4': { pulses: 2 },
  '3/4': { pulses: 3 },
  '4/4': { pulses: 4 },
  '6/8': { pulses: 2 },
  '9/8': { pulses: 3 },
  '12/8': { pulses: 4 },
} as const;

type TimeSignature = keyof typeof SIGNATURES;

type ScheduleFn = (ctx: AudioContext, time: number, accent: boolean) => void;

interface SchedulerOptions {
  ctx: AudioContext;
  beatRef: MutableRefObject<number>;
  nextNoteTime: MutableRefObject<number>;
  bpm: number;
  scheduleAhead: number;
  scheduleClickFn: ScheduleFn;
  onBeat: (beat: number) => void;
  pulsesRef: MutableRefObject<number>;
  onBeforeSchedule?: () => void;
}

export function runMetronomeScheduler({
  ctx,
  beatRef,
  nextNoteTime,
  bpm,
  scheduleAhead,
  scheduleClickFn,
  onBeat,
  pulsesRef,
  onBeforeSchedule,
}: SchedulerOptions) {
  if (bpm <= 0) return;

  while (nextNoteTime.current < ctx.currentTime + scheduleAhead) {
    if (beatRef.current === 0) {
      onBeforeSchedule?.();
    }

    const beat = beatRef.current;
    const pulsesPerBar = Math.max(1, pulsesRef.current);
    const isDownBeat = beat === 0;

    scheduleClickFn(ctx, nextNoteTime.current, isDownBeat);
    onBeat(beat);

    nextNoteTime.current += 60 / bpm;
    const nextBeat = beat + 1;
    beatRef.current = nextBeat % pulsesPerBar;
  }
}

export function useMetronome(initialBpm = 120) {
  const [bpm, setBpmState] = useState(initialBpm);
  const bpmRef = useRef(bpm);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPulse, setCurrentPulse] = useState(-1);
  const [timeSignature, setTimeSignatureState] = useState<TimeSignature>('3/4');
  const beatRef = useRef(0);
  const nextNoteTime = useRef(0);
  const timer = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const timeSignatureRef = useRef<TimeSignature>('3/4');
  const pulsesRef = useRef<number>(SIGNATURES['3/4'].pulses);
  const pendingSignatureRef = useRef<TimeSignature | null>(null);

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
      onBeat: setCurrentPulse,
      pulsesRef,
      onBeforeSchedule: () => {
        const pending = pendingSignatureRef.current;
        if (pending && pending !== timeSignatureRef.current) {
          applyTimeSignature(pending);
        } else if (pending && pending === timeSignatureRef.current) {
          pendingSignatureRef.current = null;
        }
      },
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
    setCurrentPulse(-1);
    beatRef.current = 0;
    const pending = pendingSignatureRef.current;
    if (pending) {
      applyTimeSignature(pending);
    }
  }

  function setBpm(value: number) {
    const clamped = Math.max(0, Math.min(400, value));
    setBpmState(clamped);
    if (clamped === 0) stop();
  }

  function applyTimeSignature(signature: TimeSignature) {
    timeSignatureRef.current = signature;
    pulsesRef.current = SIGNATURES[signature].pulses;
    pendingSignatureRef.current = null;
    setTimeSignatureState(signature);
    beatRef.current = 0;
  }

  function setTimeSignature(value: string) {
    if (!isTimeSignature(value)) return;

    if (!isRunning) {
      applyTimeSignature(value);
      return;
    }

    if (timeSignatureRef.current === value) {
      pendingSignatureRef.current = null;
      return;
    }

    pendingSignatureRef.current = value;
  }

  const pulsesInBar = SIGNATURES[timeSignature].pulses;
  const currentBeat = currentPulse;

  return {
    bpm,
    setBpm,
    start,
    stop,
    isRunning,
    currentBeat,
    currentPulse,
    timeSignature,
    setTimeSignature,
    pulsesInBar,
  };
}

function isTimeSignature(value: string): value is TimeSignature {
  return value in SIGNATURES;
}
