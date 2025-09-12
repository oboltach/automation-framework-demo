import { defineConfig } from 'cypress';
import mochawesome from 'cypress-mochawesome-reporter/plugin';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4000', // fallback
    specPattern: 'cypress/e2e/**/*.cy.js',
    defaultCommandTimeout: 8000,
    supportFile: 'cypress/support/e2e.js',  // load commands/reporter before every spec
    retries: 0,
    setupNodeEvents(on, config) {
      mochawesome(on);
      if (config.env?.BASE_URL) {
        config.baseUrl = config.env.BASE_URL;
      }
      return config;
    },
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
  },
  screenshotsFolder: 'cypress/reports/screenshots',
  videosFolder: 'cypress/reports/videos',
});
