// cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
	e2e: {
		baseUrl: "http://localhost:3000",
		viewportWidth: 1280,
		viewportHeight: 720,
		video: false,
		screenshotOnRunFailure: false,
		defaultCommandTimeout: 15000,
		requestTimeout: 20000,
		responseTimeout: 20000,
		pageLoadTimeout: 30000,
		env: {
			API_BASE_URL: "http://localhost:3000/api",
		},
		specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
		supportFile: "cypress/support/e2e.ts",
		excludeSpecPattern: "cypress/e2e/component/**/*",
	},
	component: {
		devServer: {
			framework: "next",
			bundler: "webpack",
		},
	},
});
