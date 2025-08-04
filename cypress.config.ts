// cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
	e2e: {
		baseUrl: "http://localhost:3000",
		viewportWidth: 1280,
		viewportHeight: 720,
		video: true,
		screenshotOnRunFailure: true,
		defaultCommandTimeout: 15000,
		requestTimeout: 20000,
		responseTimeout: 20000,
		pageLoadTimeout: 30000,
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
		env: {
			API_BASE_URL: "http://localhost:3000/api",
		},
		specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
		supportFile: "cypress/support/e2e.ts",
		// Exclude component tests from e2e runs
		excludeSpecPattern: "cypress/e2e/component/**/*",
	},
	component: {
		devServer: {
			framework: "next",
			bundler: "webpack",
		},
		specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
		supportFile: "cypress/support/component.ts",
	},
});
