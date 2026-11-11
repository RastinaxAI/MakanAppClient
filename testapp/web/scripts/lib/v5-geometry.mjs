// Read-only DOM/computed geometry. Runs inside the isolated review browser.
export function collectViewportGeometry() {
  const rect = (selector) => {
    const e = [...document.querySelectorAll(selector)].find(
      (x) => x.getBoundingClientRect().height && getComputedStyle(x).visibility !== 'hidden',
    );
    if (!e) return null;
    const b = (e.closest('[data-v5-number-input]') ?? e).getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(e);
    const text = range.getBoundingClientRect();
    return {
      x: b.x,
      y: b.y,
      width: b.width,
      height: b.height,
      fontSize: getComputedStyle(e).fontSize,
      fontWeight: getComputedStyle(e).fontWeight,
      textBounds: { x: text.x, y: text.y, width: text.width, height: text.height },
      text: e.textContent?.trim(),
      focused: e === document.activeElement,
      rowCount: e.matches('[data-candidate-list]')
        ? e.children.length
        : e.matches('.list,.v5-list')
          ? e.querySelectorAll('.v5-row,.row,label.v4-check').length
          : undefined,
    };
  };
  return {
    renderedScenarios: [
      ...document.querySelectorAll('[data-v5-scene],[data-v4-view],[data-design-scenario]'),
    ]
      .filter((element) => element.getBoundingClientRect().height > 0)
      .flatMap((element) =>
        (
          element.dataset.v5Scene ||
          element.dataset.v4View ||
          element.dataset.designScenario ||
          ''
        ).split(/\s+/),
      ),
    route: location.pathname + location.search,
    renderError: [...document.querySelectorAll('[data-app-render-error]')].some(
      (element) => element.getBoundingClientRect().height > 0,
    ),
    documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
    overflowing: [
      ...document.querySelectorAll(
        'main,form,fieldset,header,footer,nav,section,aside,input,textarea,select',
      ),
    ]
      .filter((e) => {
        const b = e.getBoundingClientRect();
        return b.width && (b.left < -1 || b.right > innerWidth + 1);
      })
      .map((e) => ({ tag: e.tagName, class: e.className }))
      .slice(0, 12),
    title: rect('.rx-head h1,.rx-head h2,[data-chat-header] h2'),
    header: rect('.rx-head,[data-chat-header]'),
    field: rect(
      '#phone-number,.rx-body-grid .input,.rx-body-grid textarea,.rx-body-grid input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),.rx-body-grid select',
    ),
    action: rect('.rx-bottom-actions button,.rx-head .head-action button'),
    policyTarget: rect('button[data-auth-policy]'),
    nav: rect(
      '.rx-tabbar,.rx-nav,nav[aria-label="ناوبری اصلی"],[data-reference-shell] > aside:first-of-type,[data-navigation-presentation="dock"]',
    ),
    context: rect('.rx-context-panel,[data-chat-context]'),
    dialog: rect('.rx-dialog,.dialog-content'),
    dialogHeading: rect('.rx-dialog-head,.dialog-heading'),
    dialogBody: rect('.rx-modal-body,.dialog-body'),
    dialogField: rect(
      '.rx-dialog .field :is(input,textarea,select):not([type="checkbox"]):not([type="radio"]),.dialog-content .v5-field :is(input,textarea,select):not([type="checkbox"]):not([type="radio"])',
    ),
    dialogSummary: rect('.rx-dialog .v4-meta,.dialog-content .v5-dialog-summary'),
    dialogPolicy: rect('.rx-dialog .policy,.dialog-content .dialog-policy'),
    dialogActions: rect('.rx-dialog-actions,.dialog-actions'),
    dialogPrimary: rect(
      '.rx-dialog-actions .btn,.dialog-actions .button-primary,.dialog-actions .button-danger,.dialog-actions .button-destructive',
    ),
    dialogHero: rect('.rx-dialog .hero,.dialog-content .v5-dialog-hero'),
    dialogHeroTitle: rect('.rx-dialog .hero h3,.dialog-content .v5-dialog-hero h3'),
    reviewCheckline: rect(
      '.rx-modal-body .checkline,.dialog-body .v5-native-checkline,.rx-body-grid .checkline',
    ),
    reviewCheckmark: rect(
      '.rx-modal-body .checkline .checkbox,.dialog-body .v5-native-checkline .checkbox,.rx-body-grid .checkline .checkbox',
    ),
    lessonAttachment: rect('.rx-body-grid .file'),
    lessonAttachmentIcon: rect('.rx-body-grid .file .doc-icon'),
    lessonAttachmentTitle: rect('.rx-body-grid .file h4,.rx-body-grid .file .v5-file-name'),
    uploadTarget: rect('.rx-body-grid .upload'),
    classMetrics: rect('[data-class-metrics],.rx-body-grid .stats'),
    classHero: rect('[data-v4-view="MK-455"] > .v5-hero,.rx-body-grid .card.hero'),
    classDetails: rect('[data-class-summary],.rx-body-grid .v4-meta'),
    classLinks: rect('[data-v4-view="MK-455"] > .v5-list,.rx-body-grid .v4-list'),
    classSearch: rect('[data-v4-view="MK-455"] > form,.rx-body-grid > .rx-unit > .search'),
    classTableHeader: rect('[data-class-table] thead,.rx-table-shell thead'),
    resourceScopes: rect('[data-source-scopes],.rx-body-grid > .rx-unit > .seg'),
    segmented: rect('.rx-body-grid .v5-segmented,.rx-body-grid .seg'),
    sceneHero: rect('.rx-body-grid .v5-hero,.rx-body-grid .card.hero'),
    assistantSources: rect(
      '.v5-assistant-body > section.card,.rx-body-grid > .rx-unit:nth-child(2) > .card',
    ),
    assistantComposer: rect(
      '.v5-assistant-body .composer,.rx-body-grid > .rx-unit > .search[style*="min-height:49px"]',
    ),
    assistantSendIcon: rect(
      '.v5-assistant-body .composer button svg,.rx-body-grid > .rx-unit > .search[style*="min-height:49px"] > svg',
    ),
    sceneAlert: rect('.rx-body-grid .alert'),
    scenePolicy: rect('.rx-body-grid .policy'),
    firstSwitch: rect('.rx-body-grid .switch-hit,.rx-body-grid .v5-switch'),
    parentSelection: rect(
      '[data-parent-active-child],.rx-body-grid > .rx-unit > .card:first-child',
    ),
    parentUpcoming: rect('[data-parent-upcoming-session],.rx-body-grid .schedule'),
    parentNotice: rect('.rx-body-grid .v5-note,.rx-body-grid > .rx-unit > .alert'),
    resourceSearch: rect('[data-source-search],.rx-body-grid > .rx-unit > .search'),
    resourceFirstRow: rect(
      '[data-source-list] > .row:first-child,.rx-body-grid > .rx-unit > .list > .row:first-child',
    ),
    listBounds: rect(
      '.rx-body-grid .v5-list,.rx-body-grid .list,.rx-body-grid [data-candidate-list],.rx-body-grid [data-chat-list] > div > div:has(> a[href^="/personal/messages/"])',
    ),
    listFirstRow: rect(
      '.rx-body-grid .v5-list .v5-row,.rx-body-grid .list .row,.rx-body-grid [data-candidate-list] > li,.rx-body-grid [data-chat-list] > div > div > a[href^="/personal/messages/"]',
    ),
    listAvatar: rect(
      '.rx-body-grid .v5-list .v5-row [class*="avatar"],.rx-body-grid .list .row .avatar,.rx-body-grid [data-chat-list] > div > div > a[href^="/personal/messages/"] > :first-child',
    ),
    search: rect('.rx-body-grid .search,.rx-body-grid [data-chat-list] > form[role="search"]'),
    listBadge: rect('.rx-body-grid .list .badge'),
    statFirst: rect('.rx-body-grid .stats .stat'),
    dialogChoices: rect('.rx-dialog .list[role="radiogroup"],.dialog-content .v5-choice-list'),
    dialogChoiceFirst: rect(
      '.rx-dialog [role="radiogroup"] .row:first-child,.dialog-content .v5-choice-list label:first-child',
    ),
    dialogChoiceText: rect(
      '.rx-dialog [role="radiogroup"] .row:first-child .grow,.dialog-content .v5-choice-list label:first-child .grow',
    ),
    welcomeBrand: rect('.rx-body-grid > img.brand-mark,.rx-body-grid > .rx-unit > svg'),
    authDigits: rect('#otp-code + div,.rx-body-grid > .rx-unit > .otp'),
    authCodeActions: rect(
      '.rx-body-grid > div:has(> button),.rx-body-grid > .rx-unit > .between.small',
    ),
    authSecurity: rect('.rx-body-grid > aside,.rx-body-grid > .rx-unit > .alert'),
    welcomeBanner: rect('.rx-body-grid .banner-title'),
    welcomeDescription: rect('.rx-body-grid > p.policy,.rx-body-grid > .rx-unit > p.policy'),
    welcomeTagline: rect('.rx-body-grid .tagline'),
    controls: [
      ...document.querySelectorAll(
        '.rx-body-grid input:not([type="hidden"]),.rx-body-grid textarea,.rx-body-grid select,.rx-body-grid button.input[aria-haspopup="dialog"],.rx-body-grid [role="checkbox"],.rx-body-grid [role="switch"],:is(.rx-dialog,.dialog-content) input:not([type="hidden"]),:is(.rx-dialog,.dialog-content) textarea,:is(.rx-dialog,.dialog-content) select,:is(.rx-dialog,.dialog-content) [role="checkbox"],:is(.rx-dialog,.dialog-content) [role="switch"]',
      ),
    ]
      .filter(
        (element) =>
          element.getBoundingClientRect().height &&
          getComputedStyle(element).visibility !== 'hidden',
      )
      .map((element) => {
        const bounds = (
          element.closest('[data-v5-number-input]') ?? element
        ).getBoundingClientRect();
        const role = element.getAttribute('role');
        const booleanControl =
          ['checkbox', 'switch'].includes(role) ||
          (element.tagName === 'INPUT' && element.type === 'checkbox');
        return {
          label:
            element.labels?.[0]?.textContent?.trim() ||
            element.getAttribute('aria-label') ||
            (booleanControl ? element.textContent?.trim() : '') ||
            '',
          accessibleLabel:
            element.getAttribute('aria-label') ||
            element.labels?.[0]?.textContent?.trim() ||
            (booleanControl ? element.textContent?.trim() : '') ||
            '',
          type: ['checkbox', 'switch'].includes(role)
            ? role
            : element.tagName === 'INPUT'
              ? element.type
              : element.tagName === 'BUTTON'
                ? 'picker'
                : element.tagName.toLowerCase(),
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          fontSize: getComputedStyle(element).fontSize,
          ...(booleanControl
            ? {
                checked: element.checked ?? element.getAttribute('aria-checked') === 'true',
                disabled: !!element.disabled || element.getAttribute('aria-disabled') === 'true',
              }
            : {}),
        };
      }),
    listAvatars: [...document.querySelectorAll('.rx-body-grid .row .avatar')].map((element) => {
      const bounds = element.getBoundingClientRect();
      return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
    }),
    reading: document.documentElement.dataset.reading,
    theme: document.documentElement.dataset.theme,
    fonts: document.fonts.check('16px Vazirmatn'),
    alerts: [...document.querySelectorAll('.error-state,[role="alert"]')]
      .map((e) => e.textContent?.trim())
      .filter(Boolean),
  };
}
