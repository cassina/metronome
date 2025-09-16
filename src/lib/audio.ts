import type { SoundKind } from './useMetronome';

type TickPlayer = (soundKind: SoundKind, accent: boolean, when: number) => void;

export function createPlayTick(ctx: AudioContext): TickPlayer {
  const destination = ctx.destination;

  return (soundKind, accent, when) => {
    switch (soundKind) {
      case 'wood':
        playWood(ctx, destination, accent, when);
        break;
      case 'hihat':
        playHiHat(ctx, destination, accent, when);
        break;
      default:
        playClick(ctx, destination, accent, when);
        break;
    }

    if (accent && 'vibrate' in navigator) {
      const delay = Math.max(when - ctx.currentTime, 0);
      window.setTimeout(() => navigator.vibrate([30, 10, 10]), delay * 1000);
    }
  };
}

function playClick(
  ctx: AudioContext,
  destination: AudioNode,
  accent: boolean,
  when: number,
) {
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(accent ? 2200 : 1800, when);

  const gain = ctx.createGain();
  const peak = accent ? 1 : 0.6;
  gain.gain.setValueAtTime(peak, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(when);
  osc.stop(when + 0.05);
}

function playWood(
  ctx: AudioContext,
  destination: AudioNode,
  accent: boolean,
  when: number,
) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(accent ? 880 : 820, when);

  const gain = ctx.createGain();
  const peak = accent ? 0.8 : 0.5;
  gain.gain.setValueAtTime(peak, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.055);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(when);
  osc.stop(when + 0.08);
}

function playHiHat(
  ctx: AudioContext,
  destination: AudioNode,
  accent: boolean,
  when: number,
) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * 0.02));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const decay = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * decay;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(8000, when);

  const gain = ctx.createGain();
  const peak = accent ? 0.7 : 0.45;
  gain.gain.setValueAtTime(peak, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.02);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(destination);

  noise.start(when);
  noise.stop(when + 0.03);
}
