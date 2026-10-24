import { describe, expect, it } from 'vitest';
import { filledPriorities, progress } from '../lib/progress';

describe('progress', () => {
  it('returns 0% for an empty list', () => {
    expect(progress([])).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it('rounds the percentage', () => {
    expect(progress([{ done: true }, { done: false }, { done: false }]).percent).toBe(33);
    expect(progress([{ done: true }, { done: true }, { done: false }]).percent).toBe(67);
  });

  it('ignores empty priority slots', () => {
    const ps = [
      { text: 'Write', done: true },
      { text: '  ', done: false },
      { text: '', done: false },
    ];
    expect(progress(filledPriorities(ps)).percent).toBe(100);
  });
});
