import { describe, expect, it } from 'vitest';
import { decodeEntities, escapeHtml } from '../src/lib/html';

describe('escapeHtml', () => {
  it('escapes &, <, >, " and \'', () => {
    expect(escapeHtml(`a&b<c>"d'e`)).toBe('a&amp;b&lt;c&gt;&quot;d&#39;e');
  });
});

describe('decodeEntities', () => {
  it('decodes the basic named and numeric entities', () => {
    expect(decodeEntities('a&amp;b&lt;c&gt;&quot;d&#39;e')).toBe(`a&b<c>"d'e`);
  });
});
