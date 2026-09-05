import { describe, expect, it } from 'vitest';
import { formatBoardDate, formatDate, postPath, postSlug, sortByDateDesc } from '../src/lib/posts';

describe('postSlug', () => {
  it('strips the YYYY-MM-DD- prefix from the entry id', () => {
    expect(postSlug('2026-09-04-airport-lounge-basics')).toBe('airport-lounge-basics');
  });

  it('keeps ids without a date prefix', () => {
    expect(postSlug('airport-lounge-basics')).toBe('airport-lounge-basics');
  });
});

describe('postPath', () => {
  it('builds a trailing-slash path under /posts/', () => {
    expect(postPath('2026-09-04-airport-lounge-basics')).toBe('/posts/airport-lounge-basics/');
  });
});

describe('sortByDateDesc', () => {
  it('sorts newest first without mutating the input', () => {
    const a = { id: 'a', data: { pubDate: new Date('2026-01-01') } };
    const b = { id: 'b', data: { pubDate: new Date('2026-03-01') } };
    const input = [a, b];
    const sorted = sortByDateDesc(input);
    expect(sorted.map((p) => p.id)).toEqual(['b', 'a']);
    expect(input.map((p) => p.id)).toEqual(['a', 'b']);
  });
});

describe('formatDate', () => {
  it('formats as Japanese year/month/day', () => {
    expect(formatDate(new Date(Date.UTC(2026, 8, 4)))).toBe('2026年9月4日');
  });
});

describe('formatBoardDate', () => {
  it('formats as zero-padded MM/DD for the departure board', () => {
    expect(formatBoardDate(new Date(Date.UTC(2026, 8, 4)))).toBe('09/04');
    expect(formatBoardDate(new Date(Date.UTC(2026, 11, 25)))).toBe('12/25');
  });
});
