import { defineConfig } from 'cypress';
import mochawesome from 'cypress-mochawesome-reporter/plugin.js'; 

export default defineConfig({
  e2e: {
    // ...your existing config...
    setupNodeEvents(on, config) {
      mochawesome(on);
      if (config.env?.BASE_URL) config.baseUrl = config.env.BASE_URL;
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
