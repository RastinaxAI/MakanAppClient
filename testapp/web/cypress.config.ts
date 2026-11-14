import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 390,
  viewportHeight: 844,
  defaultCommandTimeout: 12000,
  trashAssetsBeforeRuns: false,
  e2e: {
    baseUrl: 'http://127.0.0.1:3132',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    setupNodeEvents(on, config) {
      if (config.baseUrl !== 'http://127.0.0.1:3132')
        throw new Error('Cypress writes are restricted to the isolated fixture app on :3132.');
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.isHeadless)
          launchOptions.args.push('--window-size=2200,1400', '--force-device-scale-factor=1');
        return launchOptions;
      });
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});
