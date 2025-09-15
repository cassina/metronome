export function bpmToMs(bpm: number): number {
  if (bpm <= 0) throw new Error("bpm must be greater than 0");
  return 60000 / bpm;
}
