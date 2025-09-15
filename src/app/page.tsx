'use client';

import { useEffect, useState } from 'react';

import { TimeSignatureSelect } from '@/app/components/TimeSignatureSelect';
import { useMetronome } from '@/lib/useMetronome';

export default function MetronomeClient() {
  const {
    bpm,
    setBpm,
    start,
    stop,
    isRunning,
    currentBeat,
    timeSignature,
    setTimeSignature,
    pulsesInBar,
  } = useMetronome();
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        isRunning ? stop() : start();
      } else if (e.code === 'ArrowUp') {
        setBpm(bpm + 1);
      } else if (e.code === 'ArrowDown') {
        setBpm(bpm - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bpm, isRunning, setBpm, start, stop]);

  useEffect(() => {
    const storedSignature = localStorage.getItem('timeSignatureKey');
    if (storedSignature) {
      setTimeSignature(storedSignature);
    }
  }, [setTimeSignature]);

  useEffect(() => {
    localStorage.setItem('timeSignatureKey', timeSignature);
  }, [timeSignature]);

  const beatLabel =
    bpm === 0 || !isRunning ? 'Paused' : `${Math.max(currentBeat, 0) + 1}`;

  const buttonStateClasses = isRunning
    ? 'from-[#5eead4] via-[#34d399] to-[#2dd4bf] text-slate-950 shadow-[0_28px_65px_rgba(45,212,191,0.35)] hover:shadow-[0_34px_75px_rgba(45,212,191,0.42)]'
    : 'from-[#7c5cff] via-[#7c5cff] to-[#5eead4] text-white shadow-[0_34px_85px_rgba(124,92,255,0.5)] hover:shadow-[0_40px_95px_rgba(124,92,255,0.6)]';

  const onInstall = () => {
    installEvent?.prompt();
    setInstallEvent(null);
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-18%] h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(124, 92, 255, 0.35) 0%, rgba(124, 92, 255, 0) 70%)',
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(94, 234, 212, 0.28) 0%, rgba(94, 234, 212, 0) 70%)',
          }}
        />
        <div
          className="absolute left-[-20%] top-[35%] h-72 w-72 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(79, 70, 229, 0.22) 0%, rgba(79, 70, 229, 0) 70%)',
          }}
        />
      </div>

      <header className="z-10 flex w-full justify-center px-6 pt-6">
        <div className="flex w-full max-w-md items-center justify-between rounded-3xl border border-white/10 bg-white/10 px-5 py-4 shadow-[0_20px_55px_rgba(5,8,24,0.55)] backdrop-blur-xl">
          <div className="flex items-center gap-3 text-left">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c5cff] via-[#6a5cff] to-[#5eead4] text-xl font-semibold text-white shadow-[0_0_30px_rgba(124,92,255,0.55)]"
            >
              ♫
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-200/80">
                Pulse
              </span>
              <span className="font-display text-lg font-semibold text-white">
                Pulse Metronome
              </span>
            </div>
          </div>
          {installEvent && (
            <button
              type="button"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-100 transition-colors duration-200 hover:border-white/60 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5eead4]"
              onClick={onInstall}
            >
              Install
            </button>
          )}
        </div>
      </header>

      <section className="z-10 flex flex-1 items-center justify-center px-6 pb-12 pt-4">
        <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-[2.5rem] border border-white/10 bg-white/[0.05] px-6 py-9 text-center shadow-[0_40px_95px_rgba(5,8,24,0.7)] backdrop-blur-2xl sm:px-10 sm:py-12">
          <div className="flex flex-col items-center gap-4">
            <span
              className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-7xl font-semibold uppercase tracking-[0.4em] text-slate-200"
              aria-live="polite"
            >
              {beatLabel}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-semibold text-white sm:text-7xl">
                {bpm}
              </span>
              <span className="font-semibold uppercase tracking-[0.35em] text-slate-300">
                bpm
              </span>
            </div>
            <p className="max-w-[18rem] text-sm text-slate-400">
              {!isRunning &&
                bpm > 0 &&
                'Dial in your tempo, then tap start for a pocket-perfect groove.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            {Array.from(
              { length: Math.max(pulsesInBar, 1) },
              (_, beat) => beat,
            ).map((beat) => {
              const isActive = bpm > 0 && isRunning && currentBeat === beat;
              const isDownbeat = beat === 0;

              return (
                <span
                  key={beat}
                  aria-hidden="true"
                  className={`h-3 w-12 rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? isDownbeat
                        ? 'scale-110 bg-gradient-to-r from-[#7c5cff] via-[#6b5cff] to-[#5eead4] shadow-[0_0_40px_rgba(124,92,255,0.6)]'
                        : 'scale-105 bg-gradient-to-r from-[#5eead4] via-[#34d399] to-[#22d3ee] shadow-[0_0_38px_rgba(94,234,212,0.55)]'
                      : 'scale-90 bg-white/15 opacity-60'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            aria-label={isRunning ? 'Stop metronome' : 'Start metronome'}
            aria-pressed={isRunning}
            onClick={isRunning ? stop : start}
            className={`group relative flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gradient-to-r px-10 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5eead4] active:translate-y-[1px] ${buttonStateClasses}`}
          >
            <span className="text-base font-semibold tracking-[0.3em]">
              {isRunning ? 'Stop' : 'Start'}
            </span>
          </button>

          <div className="flex w-full flex-col gap-6 text-left">
            <label className="flex flex-col gap-3">
              <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.4em] text-slate-300/90">
                <span>Beats Per Minute</span>
                <span className="font-display text-base tracking-tight text-white">
                  {bpm}
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={400}
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                className="tempo-slider"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-300/80">
              <span>Fine Tune</span>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 transition focus-within:border-[#5eead4]/60 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_35px_rgba(94,234,212,0.25)]">
                <input
                  type="number"
                  min={0}
                  max={400}
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value || '0', 10))}
                  className="tempo-input"
                />
                <span className="text-sm font-medium tracking-normal text-slate-400">
                  Type a precise tempo
                </span>
              </div>
            </label>
            <TimeSignatureSelect
              value={timeSignature}
              onChange={(signature) => setTimeSignature(signature)}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
