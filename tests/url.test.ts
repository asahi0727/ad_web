import { describe, expect, it } from 'vitest';
import { withBase } from '../src/lib/url';

describe('withBase', () => {
  it('returns the path unchanged when base is root', () => {
    expect(withBase('/posts/foo/', '/')).toBe('/posts/foo/');
  });

  it('prefixes the base path', () => {
    expect(withBase('/posts/foo/', '/repo')).toBe('/repo/posts/foo/');
  });

  it('tolerates a trailing slash on base', () => {
    expect(withBase('/posts/foo/', '/repo/')).toBe('/repo/posts/foo/');
  });

  it('adds a leading slash to relative paths', () => {
    expect(withBase('about/', '/repo')).toBe('/repo/about/');
  });

  it('returns "/" for the root path with root base', () => {
    expect(withBase('/', '/')).toBe('/');
  });

  it('returns "/repo/" for the root path with a base', () => {
    expect(withBase('/', '/repo')).toBe('/repo/');
  });
});
