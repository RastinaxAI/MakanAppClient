import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import active from '../../design/reference.json';
import inventory from '../../design/responsive-reference.json';
describe('active V5 source and product boundary', () => {
  it('pins the exact supplied V5 PDF', () => {
    expect(active.version).toBe('5.0-blue');
    expect(
      createHash('sha256')
        .update(fs.readFileSync(active.directory + '/' + active.sourcePdf))
        .digest('hex'),
    ).toBe(active.sourcePdfSha256);
  });
  it('preserves the source inventory while keeping owner scenarios separate', () => {
    const client = inventory.screens.filter((s) => s.scope === 'client');
    expect(client).toHaveLength(482);
    expect(new Set(client.map((s) => s.scenario_id)).size).toBe(482);
    expect(inventory.screens.filter((s) => s.scope !== 'client')).toHaveLength(46);
  });
  it('does not ship an executable development atlas or its generated data', () => {
    expect(fs.existsSync('src/app/preview')).toBe(false);
    expect(fs.existsSync('src/features/reference/v5-data')).toBe(false);
    expect(fs.readFileSync('next.config.ts', 'utf8')).not.toContain('v5-data');
  });
  it('does not import old visual skins into the live renderer or root', () => {
    const root = fs.readFileSync('src/app/layout.tsx', 'utf8');
    expect(root).not.toContain('v5-author.css');
    expect(root).not.toContain('v5-product.css');
    expect(root).toContain('foundations.module.css');
    expect(root).not.toContain('v4.css');
    expect(root).not.toContain("'@/design/v5.css'");
    const renderer = fs.readFileSync('src/components/v5/scene.tsx', 'utf8');
    expect(renderer).not.toMatch(/import ['"]\.\/(blueprints|screen)\.css/);
    expect(fs.readFileSync('src/components/navigation/app-navigation.tsx', 'utf8')).not.toContain(
      '/preview/reference/',
    );
  });
});
