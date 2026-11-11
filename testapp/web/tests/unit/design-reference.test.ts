import { describe, it, expect } from 'vitest';
import spec from '../../design/responsive-reference.json';
import supplied from '../../design/reference-v5/MakanApp_Responsive_Design_v5/design-tokens.json';
import tokens from '../../design/tokens.json';
describe('current responsive reference integrity', () => {
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
    expect(tokens.light['primary-button']).toBe(tokens.light.brand);
  });
});
