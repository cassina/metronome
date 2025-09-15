export function nextNoteTime(current: number, bpm: number): number {
  return current + 60 / bpm;
}
