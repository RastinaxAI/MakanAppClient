import { describe, it, expect } from 'vitest';
import spec from '../../design/responsive-reference.json';
import supplied from '../../design/reference-v5/MakanApp_Responsive_Design_v5/design-tokens.json';
import tokens from '../../design/tokens.json';
import active from '../../design/v7-reference.json';
import {
  currentDeepViews,
  currentLayouts,
  v5DeepViews,
  v5Layouts,
} from '../../src/design/v5-layouts';
describe('current responsive reference integrity', () => {
  it('pins V7 while retaining the historical identities and keeping proposals out of the operational scope', () => {
    expect(tokens.version).toBe(active.version);
    expect(active.tokens.design_version).toBe('7.0');
    expect(active.scenes).toHaveLength(209);
    expect(new Set(active.scenes.map((scene) => scene.id)).size).toBe(209);
    expect(active.scenes.filter((scene) => scene.proposalOff)).toHaveLength(21);
    expect(active.scenes.filter((scene) => scene.domain === 'admin')).toHaveLength(14);
    expect(currentDeepViews.has('AST-09')).toBe(true);
    expect(currentDeepViews.has('ORG-27')).toBe(true);
    expect(currentDeepViews.has('ORG-37')).toBe(true);
    expect(currentLayouts['AST-09']).toBe('list');
    for (const [id, kind] of Object.entries(v5Layouts)) expect(currentLayouts[id]).toBe(kind);
    for (const id of v5DeepViews) expect(currentDeepViews.has(id)).toBe(true);
  });
  it('keeps V5 identities and current device rules distinct from obsolete reference defaults', () => {
    expect(spec.screens).toHaveLength(528);
    expect(new Set(spec.screens.map((s) => s.scenario_id)).size).toBe(528);
    expect(supplied.responsiveV5.tabletRail).toBe(76);
    expect(supplied.responsiveV5.desktopNav).toBe(208);
    expect(supplied.responsiveV5.minimumInputHeight).toBe(48);
  });
  it('keeps independent icon size and touch target tokens', () => {
    expect(tokens.layout.navIcon).toBe(24);
    expect(tokens.layout.icon).toBe(20);
    expect(tokens.layout.touchTarget).toBeGreaterThanOrEqual(44);
    expect(tokens.light.brand).toBe('#156fee');
    expect(tokens.light['primary-button']).toBe('#0D5ECC');
    expect(tokens.layout.tabletRail).toBe(72);
    expect(tokens.layout.desktopNav).toBe(208);
  });
});
