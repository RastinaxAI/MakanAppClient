// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// These tests may send messages and consume AI quota only on the loopback fixture.
// Do not hide uncaught exceptions: Cypress should fail on application errors.
let consoleErrors: string[] = [];
beforeEach(() => {
  const errors: string[] = [];
  consoleErrors = errors;
  cy.on('window:before:load', (win) => {
    const original = win.console.error.bind(win.console);
    win.console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(' '));
      original(...args);
    };
  });
  cy.intercept({ url: 'http*', middleware: true }, (request) => {
    expect(['127.0.0.1', 'localhost', '[::1]'], 'isolated application network').to.include(
      new URL(request.url).hostname,
    );
  });
});

afterEach(() => {
  expect(consoleErrors, 'application console.error across navigation and reloads').to.deep.eq([]);
});
