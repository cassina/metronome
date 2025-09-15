'use client';

import { useEffect, useState } from 'react';

import { useMetronome } from '@/lib/useMetronome';

export default function MetronomeClient() {
  const { bpm, setBpm, start, stop, isRunning, currentBeat } = useMetronome();
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

  const status =
    bpm === 0 || !isRunning ? 'Paused' : `${Math.max(currentBeat, 0) + 1}`;

  const onInstall = () => {
    installEvent?.prompt();
    setInstallEvent(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black p-4 px-12 text-white">
      {/* Beat number */}
      <div
        className={`${status === 'Paused' ? 'text-lg' : 'text-7xl '}`}
        aria-live="polite"
      >
        {status}
      </div>

      {/* Beat Dots*/}
      <div className="flex gap-2">
        {[0, 1, 2].map((b) => (
          <span
            key={b}
            className={`h-4 w-4 rounded-full ${currentBeat === b ? (b === 0 ? 'bg-red-500' : 'bg-white') : 'bg-gray-600'}`}
          />
        ))}
      </div>
      <button
        type="button"
        className="rounded bg-red-600 px-6 py-4 text-lg font-bold"
        aria-label={isRunning ? 'Stop' : 'Start'}
        onClick={isRunning ? stop : start}
      >
        {isRunning ? 'Stop' : 'Start'}
      </button>
      <label className="flex items-center gap-2">
        <span>BPM {bpm}</span>
        <input
          type="number"
          min={0}
          max={400}
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value || '0', 10))}
          className="w-20 rounded border p-1 text-black"
        />
      </label>
      <input
        type="range"
        min={0}
        max={400}
        value={bpm}
        onChange={(e) => setBpm(parseInt(e.target.value, 10))}
        className="w-full max-w-sm"
      />
      {installEvent && (
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2"
          onClick={onInstall}
        >
          Install
        </button>
      )}
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
