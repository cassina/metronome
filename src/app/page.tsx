'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isInstalled, setIsInstalled] = useState(false);
  const hasHydratedTimeSignature = useRef(false);

  type MetronomeStatus = 'paused' | 'running';

  const getBeatAriaLabel = (
    metronomeStatus: MetronomeStatus,
    display: string,
  ): string => (metronomeStatus === 'paused' ? 'Paused' : `Beat ${display}`);

  const status: MetronomeStatus =
    bpm === 0 || !isRunning ? 'paused' : 'running';
  const beatDisplay: string =
    status === 'paused' ? 'Paused' : String(Math.max(currentBeat, 0) + 1);
  const labelSize = status === 'paused' ? 'text-4xl' : 'text-7xl';
  const labelTone =
    status === 'paused'
      ? 'border-white/10 bg-white/5 shadow-none'
      : 'border-white/20 bg-white/10 shadow-[var(--glow)]';

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const getInstallationStatus = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;
      const nav = window.navigator as Navigator & { standalone?: boolean };
      return isStandalone || nav.standalone === true;
    };

    const updateInstallationStatus = () => {
      setIsInstalled(getInstallationStatus());
    };

    const handleDisplayModeChange = () => {
      updateInstallationStatus();
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };

    updateInstallationStatus();

    const displayModeMediaQuery = window.matchMedia(
      '(display-mode: standalone)',
    );
    if (typeof displayModeMediaQuery.addEventListener === 'function') {
      displayModeMediaQuery.addEventListener('change', handleDisplayModeChange);
    } else if (typeof displayModeMediaQuery.addListener === 'function') {
      displayModeMediaQuery.addListener(handleDisplayModeChange);
    }
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (typeof displayModeMediaQuery.removeEventListener === 'function') {
        displayModeMediaQuery.removeEventListener(
          'change',
          handleDisplayModeChange,
        );
      } else if (typeof displayModeMediaQuery.removeListener === 'function') {
        displayModeMediaQuery.removeListener(handleDisplayModeChange);
      }
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
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
    if (hasHydratedTimeSignature.current) {
      localStorage.setItem('timeSignatureKey', timeSignature);
    }
  }, [timeSignature]);

  useEffect(() => {
    if (hasHydratedTimeSignature.current) {
      return;
    }

    const storedSignature = localStorage.getItem('timeSignatureKey');
    if (storedSignature && storedSignature !== timeSignature) {
      setTimeSignature(storedSignature);
    }

    hasHydratedTimeSignature.current = true;
  }, [setTimeSignature, timeSignature]);

  const buttonStateClasses = isRunning
    ? 'bg-[#c74a00] text-[#f5f5f5] shadow-[var(--glow)] hover:bg-[#ff6e1f] hover:shadow-[0_0_48px_rgba(255,90,0,0.7)]'
    : 'bg-[var(--accent-primary)] text-[#f5f5f5] shadow-[var(--glow)] hover:bg-[#ff6e1f] hover:shadow-[0_0_48px_rgba(255,90,0,0.75)]';

  const onInstall = () => {
    if (!installEvent) {
      return;
    }
    installEvent.prompt();
    setInstallEvent(null);
  };

  const isInstallButtonDisabled = !installEvent;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden text-[#f5f5f5]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-18%] h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255, 90, 0, 0.32) 0%, rgba(255, 90, 0, 0) 70%)',
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(0, 95, 99, 0.28) 0%, rgba(0, 95, 99, 0) 70%)',
          }}
        />
        <div
          className="absolute left-[-20%] top-[35%] h-72 w-72 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(245, 245, 245, 0.12) 0%, rgba(245, 245, 245, 0) 70%)',
          }}
        />
      </div>

      {!isInstalled && (
        <header className="z-10 flex w-full justify-center px-6 pt-6">
          <div
            className="flex w-full max-w-md items-center justify-between rounded-3xl border bg-[rgba(0,0,0,0.35)] px-5 py-4 shadow-[0_20px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            style={{ borderColor: 'var(--accent-secondary-soft)' }}
          >
            <button
              type="button"
              disabled={isInstallButtonDisabled}
              className="rounded-full border bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#f5f5f5] transition-colors duration-200 hover:border-[color:var(--accent-secondary)] hover:bg-[rgba(255,255,255,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ borderColor: 'var(--accent-secondary-soft)' }}
              onClick={onInstall}
            >
              Install
            </button>
          </div>
        </header>
      )}
      <section className="z-10 flex flex-1 items-center justify-center px-6 pb-12 pt-4">
        <div
          className="flex w-full max-w-md flex-col items-center gap-8 rounded-[2.5rem] border bg-[rgba(0,0,0,0.45)] px-6 py-9 text-center shadow-[0_40px_95px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:px-10 sm:py-12"
          style={{ borderColor: 'var(--accent-secondary-soft)' }}
        >
          <div className="flex flex-col items-center gap-4">
            {/* biome-ignore lint/a11y/useSemanticElements: role='status' requested for the label */}
            <span
              role="status"
              aria-live="polite"
              aria-label={getBeatAriaLabel(status, beatDisplay)}
              className={`select-none rounded-full border px-4 py-1 font-semibold uppercase tracking-[0.4em] text-slate-200 ${labelSize} ${labelTone}`}
            >
              {beatDisplay}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-semibold text-[#f5f5f5] sm:text-7xl">
                {bpm}
              </span>
              <span className="font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)]">
                bpm
              </span>
            </div>
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
                        ? 'scale-110'
                        : 'scale-105'
                      : 'scale-90 opacity-70'
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? isDownbeat
                        ? 'var(--accent-primary)'
                        : '#ff7833'
                      : 'var(--accent-secondary)',
                    boxShadow: isActive ? 'var(--glow)' : 'none',
                  }}
                />
              );
            })}
          </div>

          <button
            type="button"
            aria-label={isRunning ? 'Stop metronome' : 'Start metronome'}
            aria-pressed={isRunning}
            onClick={isRunning ? stop : start}
            className={`group relative flex w-full max-w-xs items-center justify-center gap-2 rounded-full px-10 py-4 text-sm font-semibold uppercase tracking-[0.35em] transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-secondary)] active:translate-y-[1px] active:shadow-[0_0_28px_rgba(255,90,0,0.55)] ${buttonStateClasses}`}
          >
            <span className="text-base font-semibold tracking-[0.3em]">
              {isRunning ? 'Stop' : 'Start'}
            </span>
          </button>

          <div className="flex w-full flex-col gap-6 text-left">
            <label className="flex flex-col gap-3">
              <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-muted)]">
                <span>Beats Per Minute</span>
                <span className="font-display text-base tracking-tight text-[#f5f5f5]">
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

            {/*  */}
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
