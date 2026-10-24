export interface Doneable {
  done: boolean;
}

export interface Progress {
  done: number;
  total: number;
  percent: number; // 0–100, rounded
}

export function progress(items: Doneable[]): Progress {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** Only priorities with text count — empty slots are not "unfinished work". */
export function filledPriorities<T extends { text: string; done: boolean }>(ps: T[]): T[] {
  return ps.filter((p) => p.text.trim() !== '');
}
