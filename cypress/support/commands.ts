// cypress/support/commands.ts
/// <reference types="cypress" />

declare global {
	namespace Cypress {
		interface Chainable {
			dataCy(value: string): Chainable<JQuery<HTMLElement>>;
			waitForDashboardLoad(): Chainable<void>;
			selectPoliceForce(forceName: string): Chainable<void>;
			selectMonth(month: string): Chainable<void>;
			mockPoliceAPI(fixture?: string): Chainable<void>;
			waitForCharts(): Chainable<void>;
			tab(): Chainable<JQuery<HTMLElement>>;
		}
	}
}

// Select by data-cy attribute
Cypress.Commands.add("dataCy", (value) => {
	return cy.get(`[data-cy=${value}]`);
});

// Wait for dashboard to load
Cypress.Commands.add("waitForDashboardLoad", () => {
	cy.wait(3000);
	cy.contains("Police Stop & Search Dashboard").should("be.visible");
});

// Select police force
Cypress.Commands.add("selectPoliceForce", (forceName) => {
	cy.get("#force-select").click();
	cy.wait(500);

	const forceMap = {
		"city-of-london": "City of London Police",
		surrey: "Surrey Police",
		metropolitan: "Metropolitan Police Service",
	};

	const displayName =
		forceMap[forceName as keyof typeof forceMap] || forceName;
	cy.get(".MuiMenuItem-root").contains(displayName).click();
});

// Select month
Cypress.Commands.add("selectMonth", (month) => {
	cy.get("#month-select").click();
	cy.wait(500);
	cy.get(".MuiMenuItem-root").first().click();
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
	cy.wait(2000);
	cy.get("body").then(($body) => {
		if ($body.find(".apexcharts-canvas").length > 0) {
			cy.get(".apexcharts-canvas").should("be.visible");
		}
	});
});

Cypress.Commands.add("tab", { prevSubject: "element" }, (subject) => {
	return cy.wrap(subject).trigger("keydown", { key: "Tab" });
});
