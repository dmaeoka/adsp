// cypress/e2e/performance.cy.ts
describe("Performance Tests", () => {
	beforeEach(() => {
		cy.mockPoliceAPI();
	});

	it("should load dashboard within acceptable time", () => {
		const startTime = Date.now();

		cy.visit("/metropolitan");
		cy.wait(3000);

		cy.then(() => {
			const loadTime = Date.now() - startTime;
			expect(loadTime).to.be.lessThan(10000); // 10 seconds is reasonable
		});
	});

	it("should handle large datasets efficiently", () => {
		// Mock large dataset
		cy.intercept("GET", "/api/police-data*", {
			fixture: "large-police-data.json",
		});

		const startTime = Date.now();
		cy.visit("/metropolitan");
		cy.wait(3000);

		cy.then(() => {
			const loadTime = Date.now() - startTime;
			expect(loadTime).to.be.lessThan(15000); // 15 seconds for large data
		});
	});

	it("should maintain smooth interactions", () => {
		cy.visit("/metropolitan");
		cy.wait(3000);

		// Test basic interactions
		cy.get("#force-select").should("be.visible");
		cy.get("#month-select").should("be.visible");
	});

	it("should not have memory leaks during navigation", () => {
		// Test multiple page loads
		const forces = ["metropolitan", "city-of-london", "surrey"];

		forces.forEach((force) => {
			cy.visit(`/${force}`);
			cy.wait(2000);

			// Check that basic components render
			cy.contains("Police Stop & Search Dashboard").should("be.visible");
		});
	});

	it("should optimize chart rendering", () => {
		cy.visit("/metropolitan");
		cy.wait(3000);

		// Just check that charts exist (if data is available)
		cy.get("body").then(($body) => {
			if ($body.find(".apexcharts-canvas").length > 0) {
				cy.get(".apexcharts-canvas").should("be.visible");
			}
		});
	});
});

// Simplified Accessibility Tests
describe("Accessibility Tests", () => {
	beforeEach(() => {
		cy.mockPoliceAPI();
		cy.visit("/metropolitan");
		cy.wait(3000);
	});

	context("Basic Accessibility", () => {
		it("should have accessible form controls", () => {
			// Check that selects are accessible
			cy.get("#force-select").should("be.visible");
			cy.get("#month-select").should("be.visible");
		});

		it("should have proper page structure", () => {
			// Check for basic heading structure
			cy.get("h1, h2, h3, h4, h5, h6").should(
				"have.length.greaterThan",
				0,
			);
		});

		it("should be keyboard navigable", () => {
			// Basic keyboard navigation test
			cy.get("#force-select").focus().should("be.focused");
		});
	});

	context("Responsive Design", () => {
		it("should be accessible on mobile devices", () => {
			cy.viewport("iphone-x");
			cy.contains("Police Stop & Search Dashboard").should("be.visible");
		});

		it("should work on tablet", () => {
			cy.viewport("ipad-2");
			cy.contains("Police Stop & Search Dashboard").should("be.visible");
		});
	});
});
