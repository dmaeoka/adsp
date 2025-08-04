/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// cypress/support/commands.ts
/// <reference types="cypress" />

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Custom command to select DOM element by data-cy attribute.
			 * @example cy.dataCy('greeting')
			 */
			dataCy(value: string): Chainable<JQuery<HTMLElement>>;

			/**
			 * Custom command to wait for dashboard to load completely
			 */
			waitForDashboardLoad(): Chainable<void>;

			/**
			 * Custom command to select police force
			 */
			selectPoliceForce(forceName: string): Chainable<void>;

			/**
			 * Custom command to select month
			 */
			selectMonth(month: string): Chainable<void>;

			/**
			 * Custom command to mock API responses
			 */
			mockPoliceAPI(fixture?: string): Chainable<void>;

			/**
			 * Custom command to wait for charts to render
			 */
			waitForCharts(): Chainable<void>;
		}
	}
}

// Select by data-cy attribute
Cypress.Commands.add("dataCy", (value) => {
	return cy.get(`[data-cy=${value}]`);
});

// Wait for dashboard to load
Cypress.Commands.add("waitForDashboardLoad", () => {
	cy.get("#loading", { timeout: 15000 }).should("not.exist");
	cy.get("#dashboard-content", { timeout: 15000 }).should("be.visible");

	// Wait for API calls to complete
	cy.intercept("GET", "/api/police-data*").as("policeData");
	cy.wait("@policeData", { timeout: 15000 });
});

// Select police force
Cypress.Commands.add("selectPoliceForce", (forceName) => {
	cy.get("#force-select").click();
	cy.get(`[data-value="${forceName}"]`).click();
	cy.get("#force-select").should("contain", forceName);
});

// Select month
Cypress.Commands.add("selectMonth", (month) => {
	cy.get("#month-select").click();
	cy.get(`[data-value="${month}"]`).click();
	cy.get("#month-select").should("contain", month);
});

// Mock Police API
Cypress.Commands.add("mockPoliceAPI", (fixture = "police-data") => {
	cy.intercept("GET", "https://data.police.uk/api/forces", {
		fixture: "police-forces.json",
	});
	cy.intercept("GET", "/api/police-data*", { fixture: `${fixture}.json` });
});

// Wait for charts to render
Cypress.Commands.add("waitForCharts", () => {
	// Wait for ApexCharts to render
	cy.get(".apexcharts-canvas", { timeout: 10000 }).should("be.visible");

	// Wait for any chart animations to complete
	cy.wait(1000);
});
