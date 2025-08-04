// cypress/support/component.ts
import "./commands";
import { mount } from "cypress/react";

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
	namespace Cypress {
		interface Chainable {
			mount: typeof mount;
		}
	}
}

Cypress.Commands.add("mount", mount);

// Example command for mounting with theme provider
Cypress.Commands.add("mountWithTheme", (component, options = {}) => {
	return cy.mount(component, {
		...options,
		// Add any default theme provider wrapping here
	});
});
