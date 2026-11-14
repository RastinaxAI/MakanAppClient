import {
  backendRequests,
  button,
  chatId,
  choosePayer,
  fixture,
  inViewport,
  login,
  noOverflow,
  readable,
  sourceId,
  tab,
  visit,
  type Theme,
} from '../support/commands';

const composer = 'textarea[aria-label="متن پیام"]';
const question = 'textarea[aria-label="سؤال از دستیار"]';
const send = 'button[aria-label="ارسال پیام"]';
const answer = '[data-assistant-result]';

beforeEach(() => {
  fixture('reset');
  fixture('design');
  fixture('ai-integration');
});

for (const [width, height] of [
  [320, 568],
  [390, 844],
  [430, 932],
]) {
  for (const theme of ['light', 'dark'] as Theme[]) {
    describe('Mobile ' + width + ' ' + theme, () => {
      beforeEach(() => cy.viewport(width, height));

      it('login: Persian digits, invalid OTP recovery and a persistent session', () => {
        visit('/enter', theme);
        cy.get('#phone-number')
          .type('۰۹۱۲۰۰۰۰۱۰۱', { delay: 0 })
          .should('have.value', '09120000101');
        cy.get('#phone-number').should('have.css', 'text-align', 'center');
        button('دریافت کد تأیید').click();
        cy.get('#otp-code').should('be.visible').and('be.focused');
        cy.get('#otp-code').type('000000', { delay: 0 });
        button('تأیید و ادامه').click();
        cy.get('[role="alert"]').should('be.visible');
        cy.get('#otp-code').clear().type('۱۲۳۴۵۶', { delay: 0 }).should('have.value', '123456');
        cy.get('#otp-code').should('have.css', 'text-align', 'center');
        noOverflow();
        cy.screenshot('login-otp-' + theme + '-' + width, { capture: 'viewport' });
        button('تأیید و ادامه').click();
        cy.location('pathname').should('eq', '/personal/workspaces');
        cy.request({ url: '/api/client/session', log: false })
          .its('body.user.id')
          .should('be.a', 'string');
        cy.getCookies({ log: false }).then((cookies) => {
          expect(
            cookies.some(
              (cookie) => cookie.httpOnly && (cookie.expiry ?? 0) > Date.now() / 1000 + 29 * 86400,
            ),
          ).to.eq(true);
        });
        backendRequests('/api/v1/auth/otp/challenges').should('have.length', 1);
        backendRequests('/api/v1/auth/otp/verify').should('have.length', 2);
      });

      it('messaging: inbox, menus, exact back destination and acknowledged send', () => {
        login();
        visit('/personal/messages?filter=Direct&list=1', theme);
        cy.get('[data-chat-list]').contains('مریم رضایی').should('be.visible');
        noOverflow();
        inViewport('[data-composer-trigger]', 44);
        cy.get('[data-app-navigation]:visible a').should('have.length', 5);
        button('بیشترِ فهرست پیام‌ها').click();
        cy.get('[role="menuitem"]').should('have.length', 4);
        cy.get('body').type('{esc}');
        button('بیشترِ فهرست پیام‌ها').should('be.focused');
        cy.get('[data-composer-trigger]').click();
        cy.contains('h1', 'پیام جدید').should('be.visible');
        cy.get('a[aria-label="بازگشت"]:visible').click();
        cy.location('search').should('eq', '?filter=Direct&list=1');
        cy.screenshot('inbox-' + theme + '-' + width, { capture: 'viewport' });
        cy.get('[data-chat-list] a')
          .filter((_, el) => el.innerText.includes('مریم رضایی'))
          .first()
          .click();
        cy.get(composer).should('be.visible').type('پیام موبایل Latin 2026', { delay: 0 });
        inViewport(send, 44);
        noOverflow();
        cy.get(send).click();
        cy.get('[data-message-state="history"]')
          .contains('پیام موبایل Latin 2026')
          .should('be.visible');
        cy.get(composer).should('have.value', '');
        backendRequests('/api/v1/conversations/' + chatId + '/messages').should('have.length', 1);
        cy.screenshot('conversation-' + theme + '-' + width, { capture: 'viewport' });
      });

      it('assistant: inline tabs retain the draft and navigation; school quota returns one answer', () => {
        login('Student', true);
        visit('/personal/assistant?view=chat', theme);
        cy.get(question).type('سؤال موبایل فارسی Latin 2026', { delay: 0 });
        tab('منابع').click().should('have.attr', 'aria-selected', 'true');
        cy.get('[data-assistant-resources]').should('be.visible');
        cy.get('[role="dialog"]').should('not.exist');
        tab('خروجی‌ها').click();
        cy.get('#assistant-panel-outputs [role="tablist"]').should('be.visible');
        noOverflow();
        cy.screenshot('assistant-outputs-' + theme + '-' + width, { capture: 'viewport' });
        tab('گفتگو').click();
        cy.get(question).should('have.value', 'سؤال موبایل فارسی Latin 2026');
        cy.get('[data-app-navigation]:visible a').should('have.length', 5);
        choosePayer('Organization');
        button('ارسال سؤال').click();
        cy.get(answer).should('contain.text', 'پاسخ واقعی قرارداد در محیط آزمون');
        readable(answer + ' > p');
        noOverflow();
        backendRequests('/api/v1/ai/chat').then((calls) => {
          expect(calls).to.have.length(1);
          expect(calls[0].aiHeaders.payer).to.eq('Organization');
          expect(calls[0].aiHeaders.operationId).to.eq(calls[0].body.operationId);
        });
        cy.screenshot('assistant-answer-' + theme + '-' + width, { capture: 'viewport' });
      });
    });
  }
}

describe('Mobile recovery and resizing', () => {
  beforeEach(() => cy.viewport(390, 844));

  it('message reply, edit and draft survive theme changes and a keyboard-sized viewport', () => {
    login();
    visit('/personal/messages/' + chatId, 'dark');
    cy.get('[data-message-direction="incoming"]')
      .first()
      .within(() => {
        cy.get('button[aria-label]').last().click();
      });
    cy.contains('[role="menuitem"]', 'پاسخ به پیام').click();
    cy.get(composer).should('be.focused').type('پاسخ جدید به پیام', { delay: 0 });
    button('لغو پاسخ').should('be.visible');
    cy.viewport(390, 420);
    inViewport(composer, 44);
    inViewport(send, 44);
    cy.get(send).click();
    cy.get('[data-message-state="history"]')
      .contains('پاسخ جدید به پیام')
      .should('be.visible')
      .closest('[data-message-id]')
      .as('sentMessage');
    cy.get('@sentMessage').find('button[aria-label]').last().click();
    cy.contains('[role="menuitem"]', 'ویرایش پیام').click();
    cy.get(composer).clear().type('متن ویرایش‌شده', { delay: 0 });
    cy.get('form[data-ui="composer"] button[type="submit"]').click();
    cy.get('@sentMessage').should('contain.text', 'متن ویرایش‌شده');
    cy.get(composer).type('پیش‌نویس بعدی حفظ شود', { delay: 0 });
    cy.viewport(834, 1112);
    cy.window().then((win) => {
      win.localStorage.setItem('makan-theme', 'light');
      win.dispatchEvent(new win.Event('makan-theme-changed'));
    });
    cy.viewport(320, 420);
    cy.get(composer).should('have.value', 'پیش‌نویس بعدی حفظ شود');
    inViewport(send, 44);
    noOverflow();
    backendRequests('/api/v1/conversations/' + chatId + '/messages').then((calls) => {
      expect(calls).to.have.length(1);
      expect(calls[0].body.replyToMessageId).to.be.a('string');
    });
    cy.screenshot('chat-short-height-draft', { capture: 'viewport' });
  });

  it('assistant source selection uses the returned version and opens its citation', () => {
    fixture('source-ai-ready', { sourceId });
    login();
    visit('/personal/assistant?view=chat', 'dark');
    tab('منابع').click();
    cy.get('[data-assistant-resources] input[type="checkbox"]').first().check();
    tab('گفتگو').click();
    choosePayer('Individual');
    cy.get(question).type('پرسش از منبع انتخاب‌شده', { delay: 0 });
    button('ارسال سؤال').click();
    cy.get(answer).should('contain.text', 'پاسخ مستند آزمایشی');
    cy.get(answer).contains('button', 'منبع شخصی آزمایشی').click();
    cy.get('[role="dialog"] [data-citation-source]').should('be.visible');
    cy.get('[role="dialog"] a').should('have.attr', 'href', '/personal/resources/' + sourceId);
    cy.get('body').type('{esc}');
    backendRequests('/api/v1/ai/knowledge/rag/answer').then((calls) => {
      expect(calls).to.have.length(1);
      expect(calls[0].body.sources).to.deep.eq([{ sourceId, version: 1 }]);
    });
    noOverflow();
  });

  it('quota denial preserves the question and never falls back to a different payer', () => {
    fixture('ai-integration', { quotaAllowed: false });
    login('Student', true);
    visit('/personal/assistant?view=chat', 'dark');
    choosePayer('Organization');
    cy.get(question).type('این سؤال پس از خطا حفظ شود', { delay: 0 });
    button('ارسال سؤال').click();
    cy.get('main [role="alert"]').should(
      'contain.text',
      'اعتبار لازم برای این درخواست در دسترس نیست.',
    );
    cy.get('[role="banner"] button[aria-label="بازگشت"]').click();
    cy.get(question).should('have.value', 'این سؤال پس از خطا حفظ شود');
    backendRequests('/api/v1/ai/chat').should('have.length', 0);
  });

  it('lost AI acknowledgment retries the same operation after reload without losing the draft', () => {
    fixture('ai-integration', { lostAck: true });
    login();
    visit('/personal/assistant?view=chat');
    choosePayer('Individual');
    cy.get(question).type('تلاش دوبارهٔ همین سؤال', { delay: 0 });
    button('ارسال سؤال').click();
    button('تلاش دوبارهٔ همین درخواست').should('be.visible');
    cy.reload();
    cy.get(question).should('have.value', 'تلاش دوبارهٔ همین سؤال');
    button('تلاش دوبارهٔ همین درخواست').click();
    cy.get(answer).should('be.visible');
    backendRequests('/api/v1/ai/chat').then((calls) => {
      expect(calls).to.have.length(2);
      expect(calls[0].body).to.deep.eq(calls[1].body);
      expect(calls[0].aiHeaders).to.deep.eq(calls[1].aiHeaders);
    });
  });

  it('login validation makes no request; throttling retains the number and permits a deliberate retry', () => {
    visit('/enter');
    cy.get('#phone-number').type('0912', { delay: 0 });
    button('دریافت کد تأیید').click();
    cy.get('[role="alert"]').should('be.visible');
    backendRequests('/api/v1/auth/otp/challenges').should('have.length', 0);
    fixture('fault', { path: '/auth/otp/challenges', method: 'POST', status: 429, retryAfter: 2 });
    cy.intercept('POST', '/api/client/auth/challenge').as('challenge');
    cy.get('#phone-number').clear().type('09120000101', { delay: 0 });
    button('دریافت کد تأیید').click();
    cy.wait('@challenge').its('response.statusCode').should('eq', 429);
    button('دریافت کد تأیید').should('be.disabled');
    cy.get('#phone-number').should('have.value', '09120000101');
    button('دریافت کد تأیید').should('be.enabled').click();
    cy.get('#otp-code').should('be.visible');
    backendRequests('/api/v1/auth/otp/challenges').should('have.length', 2);
    noOverflow();
  });

  it('changing assistant tabs during a pending answer never submits a second operation', () => {
    login();
    visit('/personal/assistant?view=chat');
    choosePayer('Individual');
    fixture('fault', { path: '/ai/chat', method: 'POST', delay: 2500 });
    cy.intercept('POST', '**/api/v1/ai/chat').as('chat');
    cy.get(question).type('پرسش در حال پاسخ', { delay: 0 });
    button('ارسال سؤال').click();
    tab('منابع').click();
    tab('خروجی‌ها').click();
    tab('گفتگو').click();
    cy.wait('@chat').its('response.statusCode').should('eq', 200);
    cy.get(answer).should('have.length', 1).and('contain.text', 'پاسخ واقعی قرارداد در محیط آزمون');
    backendRequests('/api/v1/ai/chat').should('have.length', 1);
    cy.get('[data-app-navigation]:visible a').should('have.length', 5);
  });

  it('header search retains its query after reload and returns to the exact list filter', () => {
    login();
    visit('/personal/messages?filter=Direct&list=1', 'dark');
    cy.get('[data-inbox-header] [aria-label="انجام جستجوی گفتگو"]').click();
    cy.get('input[aria-label="جستجوی گفتگوها"]')
      .should('have.length', 1)
      .type('نام طولانی فارسی Latin 2026{enter}', { delay: 0 });
    cy.location('search').should('include', 'q=');
    cy.location('search').should((value) => {
      expect(new URLSearchParams(value).get('from')).to.eq(
        '/personal/messages?filter=Direct&list=1',
      );
    });
    cy.reload();
    cy.get('input[aria-label="جستجوی گفتگوها"]').should(
      'have.value',
      'نام طولانی فارسی Latin 2026',
    );
    cy.get('[data-inbox-header] a[aria-label="بازگشت"]').click();
    cy.location('search').should('eq', '?filter=Direct&list=1');
    cy.contains('button[aria-pressed]', 'مستقیم').should('have.attr', 'aria-pressed', 'true');
    cy.get('[data-chat-list] input').should('not.exist');
    cy.get('[data-chat-list]').contains('مریم رضایی').should('be.visible');
    noOverflow();
    cy.screenshot('search-return-direct', { capture: 'viewport' });
  });

  it('a failed attachment upload preserves its file and caption and can be retried explicitly', () => {
    login();
    visit('/personal/messages/' + chatId, 'dark');
    cy.get(composer).type('توضیح فایل حفظ شود', { delay: 0 });
    button('افزودن پیوست').click();
    cy.contains('[role="menuitem"]', 'فایل از دستگاه').click();
    cy.get('input[type="file"]')
      .first()
      .selectFile('tests/fixtures/media-test-file.txt', { force: true });
    cy.get('[role="dialog"]').should('be.visible');
    fixture('fault', { path: '/api/v1/files', method: 'POST', status: 503 });
    cy.get('[role="dialog"]').within(() => {
      cy.get('textarea').should('have.value', 'توضیح فایل حفظ شود');
      cy.contains('button', 'ارسال ۱ پیوست').click();
      cy.get('[role="alert"]').should('be.visible');
      cy.contains('media-test-file.txt').should('be.visible');
      cy.get('textarea').should('have.value', 'توضیح فایل حفظ شود');
    });
    noOverflow();
    cy.screenshot('attachment-upload-retry', { capture: 'viewport' });
    cy.get('[role="dialog"]').contains('button', 'ارسال ۱ پیوست').click();
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('[data-message-state="history"]').contains('media-test-file.txt').should('be.visible');
    backendRequests('/api/v1/conversations/' + chatId + '/messages').should('have.length', 1);
  });
});

for (const theme of ['light', 'dark'] as Theme[]) {
  it('200% text and short mobile views preserve reachable controls in ' + theme, () => {
    login();
    cy.viewport(320, 420);
    visit('/personal/messages?list=1', theme, true);
    cy.get('html').should('have.attr', 'data-reading', 'large');
    for (const width of [320, 390, 430]) {
      cy.viewport(width, 420);
      inViewport('[data-composer-trigger]', 44);
      noOverflow();
      cy.get('[data-app-navigation]:visible a').should(($links) => {
        expect($links).to.have.length(5);
        const firstRow = $links[0].getBoundingClientRect();
        expect($links[3].getBoundingClientRect().top).to.be.gte(firstRow.bottom - 1);
      });
    }
    cy.screenshot('inbox-large-short-' + theme, { capture: 'viewport' });
    visit('/personal/messages/' + chatId, theme, true);
    cy.get(composer).type('نام خیلی طولانی فارسی و English-file-2026.pdf', { delay: 0 });
    for (const width of [320, 390, 430]) {
      cy.viewport(width, 420);
      inViewport(send, 44);
      noOverflow();
    }
    cy.get('[data-app-navigation]:visible').should('not.exist');
    visit('/personal/assistant?view=chat', theme, true);
    cy.get(question).scrollIntoView().type('پیش‌نویس خوانا و قابل دسترس', { delay: 0 });
    noOverflow();
    tab('منابع').click();
    tab('خروجی‌ها').click();
    tab('گفتگو').click();
    cy.get(question).should('have.value', 'پیش‌نویس خوانا و قابل دسترس');
    cy.get('[data-app-navigation]:visible a').should('have.length', 5);
    cy.screenshot('assistant-large-short-' + theme, { capture: 'viewport' });
  });
}

for (const role of ['Teacher', 'Parent', 'Manager'] as const) {
  it(
    role + ' can open messaging and receive an acknowledged personal assistant response on mobile',
    () => {
      cy.viewport(390, 844);
      login(role, true);
      cy.request({ url: '/api/client/session', log: false })
        .its('body.context.activeRole')
        .should('eq', role);
      visit('/personal/messages?list=1');
      cy.get('[data-inbox-header]').should('be.visible');
      visit('/personal/assistant?view=chat');
      choosePayer('Individual');
      cy.get(question).type('پرسش مجاز نقش ' + role, { delay: 0 });
      button('ارسال سؤال').click();
      cy.get(answer).should('contain.text', 'پاسخ واقعی قرارداد در محیط آزمون');
      backendRequests('/api/v1/ai/chat').should('have.length', 1);
      noOverflow();
    },
  );
}

it('tablet and desktop retain their layout while mobile chat and assistant drafts survive resizing', () => {
  login();
  visit('/personal/messages?list=1', 'dark');
  for (const [width, height] of [
    [834, 1112],
    [1440, 1000],
  ]) {
    cy.viewport(width, height);
    inViewport('[data-composer-trigger]', 44);
    noOverflow();
  }
  visit('/personal/messages/' + chatId, 'dark');
  cy.get(composer).type('پیش‌نویس میان دستگاه‌ها', { delay: 0 });
  for (const [width, height] of [
    [834, 1112],
    [1440, 1000],
    [390, 420],
  ]) {
    cy.viewport(width, height);
    cy.get(composer).should('have.value', 'پیش‌نویس میان دستگاه‌ها');
    inViewport(send, 44);
    noOverflow();
  }
  visit('/personal/assistant?view=chat', 'dark');
  cy.get(question).type('پیش‌نویس پایدار دستیار', { delay: 0 });
  for (const [width, height] of [
    [834, 1112],
    [1440, 1000],
    [390, 844],
  ]) {
    cy.viewport(width, height);
    tab('منابع').click();
    tab('خروجی‌ها').click();
    tab('گفتگو').click();
    cy.get(question).should('have.value', 'پیش‌نویس پایدار دستیار');
    noOverflow();
    cy.screenshot('assistant-responsive-' + width, { capture: 'viewport' });
  }
  backendRequests('/api/v1/ai/chat').should('have.length', 0);
});

it('a new assistant answer is readable immediately inside the 320px scrollport', () => {
  cy.viewport(320, 568);
  login();
  visit('/personal/assistant?view=chat', 'dark');
  choosePayer('Individual');
  cy.get(question).type('پرسش کوتاه روی صفحهٔ کوچک', { delay: 0 });
  button('ارسال سؤال').click();
  cy.get(answer).should('contain.text', 'پاسخ واقعی قرارداد در محیط آزمون');
  readable(answer + ' > p');
  cy.screenshot('assistant-small-readable', { capture: 'viewport' });
  cy.get(answer)
    .parents()
    .filter(
      (_, element) =>
        /^(auto|scroll)$/.test(
          element.ownerDocument.defaultView!.getComputedStyle(element).overflowY,
        ) && element.scrollHeight > element.clientHeight,
    )
    .first()
    .as('answerScroll');
  cy.get('@answerScroll').scrollTo('top');
  cy.window().then((win) => {
    win.localStorage.setItem('makan-theme', 'light');
    win.dispatchEvent(new win.Event('makan-theme-changed'));
  });
  cy.get('html').should('have.attr', 'data-theme', 'light');
  cy.get('@answerScroll').invoke('scrollTop').should('eq', 0);
});
