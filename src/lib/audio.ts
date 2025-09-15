export function scheduleClick(ctx: AudioContext, time: number, accent: boolean) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = accent ? 2000 : 1000;
  gain.gain.value = accent ? 1 : 0.5;
  const duration = accent ? 0.03 : 0.02;
  osc.start(time);
  osc.stop(time + duration);
  if (accent && 'vibrate' in navigator) {
    const delay = Math.max(time - ctx.currentTime, 0);
    window.setTimeout(() => navigator.vibrate([30, 10, 10]), delay * 1000);
  }
}
