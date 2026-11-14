/// <reference types="cypress" />
export const appOrigin = 'http://127.0.0.1:3132';
export const fixtureOrigin = 'http://127.0.0.1:3457';
export const chatId = '00000000-0000-4000-8000-000000000009';
export const sourceId = '00000000-0000-4000-8000-000000001500';
export type Theme = 'light' | 'dark';

export function fixture(path: string, body = {}) {
  return cy
    .request({ method: 'POST', url: fixtureOrigin + '/__test__/' + path, body, log: false })
    .then((response) => {
      expect(response.headers['x-makan-test-fixture']).to.eq('true');
      return response;
    });
}

export function backendRequests(path: string, method = 'POST') {
  return cy
    .request({ url: fixtureOrigin + '/__test__/state', log: false })
    .then(({ body }) =>
      body.requests.filter(
        (request: { path: string; method: string }) =>
          request.path === path && request.method === method,
      ),
    );
}

export function login(
  role: 'Student' | 'Teacher' | 'Parent' | 'Manager' = 'Student',
  school = false,
) {
  const phoneNumber = {
    Student: '09120000101',
    Teacher: '09120000102',
    Parent: '09120000103',
    Manager: '09120000104',
  }[role];
  return cy
    .request({
      method: 'POST',
      url: '/api/client/auth/challenge',
      headers: { Origin: appOrigin },
      body: { phoneNumber },
      log: false,
    })
    .then(({ body: challenge }) =>
      cy.request({
        method: 'POST',
        url: '/api/client/auth/verify',
        headers: { Origin: appOrigin },
        body: {
          phoneNumber,
          challengeId: challenge.challengeId,
          code: '123456',
          deviceName: 'Isolated Cypress acceptance',
        },
        log: false,
      }),
    )
    .then(() => cy.request({ url: '/api/client/session', log: false }))
    .then(({ body: session }) => {
      expect(session.user.id).to.be.a('string');
      expect(session.revision).to.be.a('string');
      if (!school) return;
      return cy
        .request({
          url: '/api/client/backend/api/v1/workspaces/me',
          headers: { 'X-Makan-Context': session.revision },
          log: false,
        })
        .then(({ body: workspaces }) => {
          const space = workspaces.find((value: { role: string }) => value.role === role);
          expect(space, 'authorized fixture school role').to.exist;
          return cy.request({
            method: 'POST',
            url: '/api/client/backend/api/v1/workspaces/select',
            headers: { Origin: appOrigin, 'X-Makan-Context': session.revision },
            body: {
              workspaceType: 'Organization',
              membershipId: space.membershipId,
              role: space.role,
            },
            log: false,
          });
        });
    });
}

export function visit(path: string, theme: Theme = 'light', largeText = false) {
  return cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('makan-theme', theme);
      win.localStorage.setItem('makan-reading', largeText ? 'large' : 'system');
    },
  });
}

export function button(name: string) {
  return cy
    .get('button')
    .filter(
      (_, element) => (element.getAttribute('aria-label') ?? element.innerText).trim() === name,
    )
    .filter(':visible')
    .should('have.length', 1);
}

export function tab(name: string) {
  return cy
    .get('[role="tab"]')
    .filter((_, element) => element.innerText.trim() === name)
    .should('have.length', 1);
}

export function noOverflow() {
  cy.document().should((doc) => {
    expect(doc.documentElement.scrollWidth, 'document horizontal overflow').to.be.lte(
      doc.defaultView!.innerWidth + 1,
    );
  });
}

export function inViewport(selector: string, minimumHeight = 0) {
  return cy
    .get(selector)
    .filter(':visible')
    .should(($elements) => {
      expect($elements.length).to.be.greaterThan(0);
      for (const element of $elements) {
        const rect = element.getBoundingClientRect();
        const win = element.ownerDocument.defaultView!;
        expect(rect.left, selector + ' left').to.be.gte(-1);
        expect(rect.top, selector + ' top').to.be.gte(-1);
        expect(rect.right, selector + ' right').to.be.lte(win.innerWidth + 1);
        expect(rect.bottom, selector + ' bottom').to.be.lte(win.innerHeight + 1);
        expect(rect.height, selector + ' height').to.be.gte(minimumHeight);
      }
    });
}

export function choosePayer(value: 'Individual' | 'Organization') {
  cy.get('[role="banner"] button')
    .filter((_, element) =>
      /^(انتخاب سهمیه|سهمیه عادی|سهمیه آموزشگاه)$/.test(element.innerText.trim()),
    )
    .click();
  cy.get('[role="dialog"]')
    .should('be.visible')
    .within(() => {
      cy.get('select').select(value);
      button('تأیید انتخاب').click();
    });
  cy.get('[role="dialog"]').should('not.exist');
}

/** A readable response must fit the actual nested scrollport, not just the window. */
export function readable(selector: string) {
  return cy
    .get(selector)
    .first()
    .should(($elements) => {
      const element = $elements[0];
      const win = element.ownerDocument.defaultView!;
      let top = 0;
      let bottom = win.innerHeight;
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (!/^(auto|scroll|hidden|clip)$/.test(win.getComputedStyle(parent).overflowY)) continue;
        const bounds = parent.getBoundingClientRect();
        top = Math.max(top, bounds.top + parent.clientTop);
        bottom = Math.min(bottom, bounds.top + parent.clientTop + parent.clientHeight);
      }
      const rect = element.getBoundingClientRect();
      expect(rect.top, 'response above the scrollport').to.be.gte(top - 1);
      expect(rect.bottom, 'response below the scrollport').to.be.lte(bottom + 1);
    });
}
