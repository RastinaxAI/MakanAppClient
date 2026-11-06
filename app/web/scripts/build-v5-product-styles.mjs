import fs from 'node:fs/promises';
import postcss from 'postcss';
import { format, resolveConfig } from 'prettier';
const base = 'design/reference-v5/MakanApp_Responsive_Design_v5/editable-source';
const tree = postcss.parse(await fs.readFile(base + '/assets/ui.css', 'utf8'));
const allowed =
  /^\.(card|row|list|field|input|btn|ibtn|badge|avatar|tile-icon|grow|flex|between|stack|muted|tiny|small|center|accent|policy|file|kv|key|val|seg|chip|upload|section-title|stats|stat|progress|empty|checkbox|radio|toggle|bubble|message|msg-time|checkline|alert|success-mark|latin|danger|text-action|tagline|switch-hit|spacer|hairline|nowrap|svg-lg|ring|sr-only|avatar-stack|search|pill|count|chips|button-row|link-pair|link-card|stepper|timeline|time-step|date-strip|date-cell|schedule|checklist|meta|banner-title|mini-doc|chat-row|day-pill|quote|composer|pinned|channel-post|ai-card|otp|skeleton|banner-bottom|audio|check-circle|tagline|two-col|user-summary|three-lines|loading-dot|quiz-option|question-nos|grade|data-table)(?:[\s.:>#\[]|$)/;
for (const n of [...tree.nodes]) if (n.type !== 'rule') n.remove();
tree.walkRules((r) => {
  const s = r.selectors.filter(
    (s) => allowed.test(s) || /^(svg|button|input|a|b|strong)(?:$|[,:. >])/.test(s),
  );
  if (!s.length) r.remove();
  else r.selectors = s.map((selector) => ':where(.rx-root) ' + selector);
});
const supplements = [];
for (const filename of ['education.css', 'blue-theme.css', 'expansion.css']) {
  const sheet = postcss.parse(await fs.readFile(base + '/assets/' + filename, 'utf8'));
  for (const node of [...sheet.nodes]) if (node.type !== 'rule') node.remove();
  sheet.walkRules((rule) => {
    const selectors = rule.selectors.filter(
      (selector) =>
        !/(^|[\s,])\.(sheet|cover|toc[^ .:]*|desktop|tablet-inner|responsive-frame|v4-toolbar|viewer-target|v4-doc[^ .:]*|v4-index[^ .:]*|board|foundation-grid|component-board)(?:[ .:#[]|$)/.test(
          selector,
        ),
    );
    const scoped = selectors
      .filter(
        (selector) =>
          !/^\.(screen|dark-ui)(?:[\s.:#[]|$)/.test(selector) ||
          /^\.(screen\.dark|dark-ui)\s/.test(selector),
      )
      .map((selector) => {
        if (/^\.(screen\.dark|dark-ui)\s/.test(selector))
          return selector.replace(
            /^\.(screen\.dark|dark-ui)/,
            ':is(.rx-root.dark, :where(:root[data-theme="dark"]) .rx-root)',
          );
        return ':where(.rx-root) ' + selector;
      });
    if (!scoped.length) rule.remove();
    else rule.selectors = scoped;
  });
  supplements.push(sheet.toString());
}
let responsive = await fs.readFile(base + '/responsive.css', 'utf8');
responsive = responsive.replaceAll(
  '.rx-root.dark',
  ':is(.rx-root.dark, :where(:root[data-theme="dark"]) .rx-root)',
);
const responsiveTree = postcss.parse(responsive);
responsiveTree.walkRules((rule) => {
  if (rule.nodes.some((n) => n.type === 'decl' && n.prop === 'font' && n.value === 'inherit'))
    rule.selectors = rule.selectors.map((selector) =>
      selector.replace(/^\.rx-root (button|input|textarea)$/u, ':where(.rx-root) $1'),
    );
});
responsive = responsiveTree.toString();
await fs.writeFile(
  'src/design/v5-author.css',
  await format(
    '/* Generated from the supplied V5 source. Do not edit. */\n' +
      tree.toString() +
      '\n' +
      supplements.join('\n') +
      '\n' +
      responsive,
    { ...(await resolveConfig('src/design/v5-author.css')), filepath: 'src/design/v5-author.css' },
  ),
);
