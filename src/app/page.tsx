'use client';

import { useEffect, useId, useState } from 'react';

import { useMetronome } from '@/lib/useMetronome';

export default function MetronomeClient() {
  const { bpm, setBpm, start, stop, isRunning, currentBeat } = useMetronome();
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const sliderId = useId();
  const fineTuneId = useId();

  useEffect(() => {
    const handler = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallEvent(event);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        isRunning ? stop() : start();
      } else if (event.code === 'ArrowUp') {
        setBpm(bpm + 1);
      } else if (event.code === 'ArrowDown') {
        setBpm(bpm - 1);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bpm, isRunning, setBpm, start, stop]);

  const statusLabel = isRunning && bpm > 0 ? 'Playing' : 'Paused';
  const showPausedOverlay = !isRunning || bpm <= 0;
  const beatDisplay = isRunning && bpm > 0 ? Math.max(currentBeat, 0) + 1 : '—';

  const handleInstall = () => {
    void installEvent?.prompt();
    setInstallEvent(null);
  };

  const updateBpm = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    const clamped = Number.isNaN(parsed)
      ? 0
      : Math.min(Math.max(parsed, 0), 400);
    setBpm(clamped);
  };

  return (
    <main className='app-shell'>
      <div className='metronome-card'>
        <div
          className='status-chip'
          data-state={statusLabel.toLowerCase()}
          aria-live='polite'
        >
          {statusLabel}
        </div>

        {installEvent && (
          <button
            type='button'
            className='install-button'
            onClick={handleInstall}
          >
            Install
          </button>
        )}

        <div className='card-content'>
          <div className='tempo-display'>
            <span className='tempo-label'>Tempo</span>
            <span className='tempo-value' aria-live='polite'>
              {bpm}
            </span>
            <span className='tempo-unit'>BPM</span>
          </div>

          <div className='beat-section'>
            <span className='beat-label'>Beat</span>
            <div className='beat-pips' aria-hidden='true'>
              {[0, 1, 2].map((beat) => {
                const isActive = bpm > 0 && isRunning && currentBeat === beat;

                return (
                  <span
                    key={beat}
                    className={`beat-pip${isActive ? ' is-active' : ''}`}
                  />
                );
              })}
            </div>
            <span className='beat-value' aria-live='polite'>
              {beatDisplay}
            </span>
          </div>

          <button
            type='button'
            aria-label={isRunning ? 'Stop metronome' : 'Start metronome'}
            aria-pressed={isRunning}
            onClick={isRunning ? stop : start}
            className='start-stop-button'
            data-state={statusLabel.toLowerCase()}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>

          <div className='controls-stack'>
            <label className='slider-control' htmlFor={sliderId}>
              <span className='control-label'>
                <span>Beats per minute</span>
                <span className='control-label__value'>{bpm}</span>
              </span>
              <input
                id={sliderId}
                type='range'
                min={0}
                max={400}
                value={bpm}
                onChange={(event) => updateBpm(event.target.value)}
                className='tempo-slider'
              />
            </label>

            <label className='number-control' htmlFor={fineTuneId}>
              <span className='control-heading'>Fine tune</span>
              <div className='number-field'>
                <input
                  id={fineTuneId}
                  type='number'
                  min={0}
                  max={400}
                  inputMode='numeric'
                  value={bpm}
                  onChange={(event) => updateBpm(event.target.value || '0')}
                  className='tempo-input'
                />
                <span className='number-hint'>
                  Tap or type to adjust precisely
                </span>
              </div>
            </label>
          </div>
        </div>

        <div
          className={`paused-overlay${
            showPausedOverlay ? ' paused-overlay--visible' : ''
          }`}
          aria-hidden='true'
        >
          <div className='paused-overlay__content'>
            <span className='paused-overlay__icon' aria-hidden='true'>
              ⏸
            </span>
            <span className='paused-overlay__label'>Paused</span>
            <span className='paused-overlay__helper'>Tap Start to play</span>
          </div>
        </div>
      </div>
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
