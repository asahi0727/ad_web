import { describe, expect, it } from 'vitest';
import { siteConfig } from '../site.config';

describe('siteConfig', () => {
  it('has a title and description', () => {
    expect(siteConfig.title.length).toBeGreaterThan(0);
    expect(siteConfig.description.length).toBeGreaterThan(0);
  });
});
