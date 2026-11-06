import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import active from '../../design/reference-v4-archive.json';
import manifest from '../../design/reference-v4/screens.json';
import mapping from '../../design/v4-traceability.json';
import tokens from '../../design/tokens.json';
describe('archived V4 binding boundary', () => {
  it('pins the supplied 189-page PDF by hash rather than silently reusing V3', () => {
    expect(active.version).toBe('4.0-blue');
    expect(
      createHash('sha256')
        .update(fs.readFileSync(active.directory + '/' + active.sourcePdf))
        .digest('hex'),
    ).toBe(active.sourcePdfSha256);
  });
  it('accounts for every unique MK ID, including the separate owner application', () => {
    expect(manifest.screens).toHaveLength(467);
    expect(new Set(manifest.screens.map((s) => s.id)).size).toBe(467);
    expect(mapping.screens.map((s) => s.id)).toEqual(manifest.screens.map((s) => s.id));
    expect(mapping.screens.filter((s) => s.scope === 'client')).toHaveLength(426);
    expect(mapping.screens.filter((s) => s.scope !== 'client')).toHaveLength(41);
  });
  it('keeps all owner actions out of the retained product binding modules', () => {
    const ownerIds = new Set(manifest.screens.filter((s) => s.scope !== 'client').map((s) => s.id));
    const retained = fs.readdirSync('src/features/reference/views');
    expect(retained.length).toBeGreaterThan(0);
    for (const name of retained) expect(ownerIds.has(name.replace('.ts', ''))).toBe(false);
  });
  it('resolves every explicit product binding while retaining the historical map as evidence', () => {
    for (const name of fs.readdirSync('src/features/reference/bundles')) {
      const source = fs.readFileSync('src/features/reference/bundles/' + name, 'utf8');
      for (const match of source.matchAll(/from ['"]\.\.\/views\/(MK-\d+)['"]/g))
        expect(fs.existsSync('src/features/reference/views/' + match[1] + '.ts')).toBe(true);
    }
    expect(mapping.scope).toContain('not a claim');
  });
  it('uses the exact V4 surface, brand button, border and dark palette', () => {
    const supplied = JSON.parse(fs.readFileSync('design/reference-v4/design-tokens.json', 'utf8'));
    expect(tokens.light['primary-button'].toUpperCase()).toBe(supplied.brand);
    expect(tokens.light.bg.toUpperCase()).toBe('#F5F8FE');
    expect(tokens.light.surface.toUpperCase()).toBe('#FFFFFF');
    expect(tokens.dark.bg.toUpperCase()).toBe('#101A2B');
    expect(tokens.dark.surface.toUpperCase()).toBe('#16243A');
    expect(tokens.dark.text.toUpperCase()).toBe('#ECF3FF');
  });
});
