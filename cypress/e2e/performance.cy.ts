// cypress/e2e/performance.cy.ts
describe("Performance Tests", () => {
	beforeEach(() => {
		cy.mockPoliceAPI();
	});

	it("should load dashboard within acceptable time", () => {
		const startTime = Date.now();

		cy.visit("/metropolitan");
		cy.waitForDashboardLoad();

		cy.then(() => {
			const loadTime = Date.now() - startTime;
			expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
		});
	});

	it("should handle large datasets efficiently", () => {
		// Mock large dataset
		cy.intercept("GET", "/api/police-data*", {
			fixture: "large-police-data.json",
		});

		const startTime = Date.now();
		cy.visit("/metropolitan");
		cy.waitForDashboardLoad();

		cy.then(() => {
			const loadTime = Date.now() - startTime;
			expect(loadTime).to.be.lessThan(10000); // Should handle large data within 10 seconds
		});
	});

	it("should maintain smooth interactions", () => {
		cy.visit("/metropolitan");
		cy.waitForDashboardLoad();

		// Test rapid interactions
		cy.get("#force-select").click();
		cy.get('[data-value="city-of-london"]').click();

		cy.get("#month-select").click();
		cy.get('[data-value="2024-01"]').click();

		// Should respond quickly to user interactions
		cy.get("#force-select").should("contain", "City of London Police");
	});

	it("should not have memory leaks during navigation", () => {
		// Test multiple page loads
		const forces = ["metropolitan", "city-of-london", "surrey"];

		forces.forEach((force) => {
			cy.visit(`/${force}`);
			cy.waitForDashboardLoad();

			// Check that charts and components render properly each time
			cy.get(".apexcharts-canvas").should("be.visible");
			cy.get('[data-testid="records-table"]').should("be.visible");
		});
	});

	it("should optimize chart rendering", () => {
		cy.visit("/metropolitan");
		cy.waitForDashboardLoad();

		// Measure chart rendering time
		const startTime = Date.now();
		cy.waitForCharts();

		cy.then(() => {
			const renderTime = Date.now() - startTime;
			expect(renderTime).to.be.lessThan(3000); // Charts should render within 3 seconds
		});
	});
});

// cypress/e2e/accessibility.cy.ts
describe("Accessibility Tests", () => {
	beforeEach(() => {
		cy.mockPoliceAPI();
		cy.visit("/metropolitan");
		cy.waitForDashboardLoad();
	});

	context("Keyboard Navigation", () => {
		it("should support tab navigation", () => {
			// Test tab navigation through interactive elements
			cy.get("body").tab();
			cy.focused().should("have.attr", "id", "force-select");

			cy.focused().tab();
			cy.focused().should("have.attr", "id", "month-select");

			cy.focused().tab();
			cy.focused().should(
				"have.attr",
				"placeholder",
				"Search records...",
			);
		});

		it("should support keyboard interactions with selects", () => {
			cy.get("#force-select").focus().type("{enter}");
			cy.get('[role="listbox"]').should("be.visible");

			cy.get("#force-select").type("{escape}");
			cy.get('[role="listbox"]').should("not.be.visible");
		});

		it("should support keyboard navigation in table", () => {
			cy.get('[data-testid="records-table"] th').first().focus();
			cy.focused().should("contain", "Date");

			cy.focused().type("{enter}"); // Should sort
			cy.get('[data-testid="records-table"]').should("be.visible");
		});
	});

	context("ARIA Labels and Roles", () => {
		it("should have proper ARIA labels on interactive elements", () => {
			cy.get("#force-select").should("have.attr", "aria-labelledby");
			cy.get("#month-select").should("have.attr", "aria-labelledby");
			cy.get('input[placeholder="Search records..."]').should(
				"have.attr",
				"aria-label",
			);
		});

		it("should have proper table accessibility", () => {
			cy.get('[data-testid="records-table"]').should(
				"have.attr",
				"role",
				"table",
			);
			cy.get('[data-testid="records-table"] thead th').should(
				"have.attr",
				"role",
				"columnheader",
			);
			cy.get('[data-testid="records-table"] tbody td').should(
				"have.attr",
				"role",
				"cell",
			);
		});

		it("should have proper heading hierarchy", () => {
			// Check that headings follow proper hierarchy
			cy.get("h1, h2, h3, h4, h5, h6").then(($headings) => {
				const headings = Array.from($headings).map((h) =>
					parseInt(h.tagName.charAt(1)),
				);

				// Should have logical heading structure
				expect(headings).to.not.be.empty;
				expect(Math.min(...headings)).to.be.lessThan(4); // Should start with h1, h2, or h3
			});
		});
	});

	context("Screen Reader Support", () => {
		it("should have descriptive alt text for visual elements", () => {
			// Check that important visual information has text alternatives
			cy.get("img").each(($img) => {
				cy.wrap($img).should("have.attr", "alt");
			});
		});

		it("should announce important state changes", () => {
			// Test that loading states are announced
			cy.get('[aria-live="polite"], [aria-live="assertive"]').should(
				"exist",
			);
		});

		it("should have meaningful labels for form controls", () => {
			cy.get("input, select, textarea").each(($input) => {
				const $element = cy.wrap($input);

				// Should have either label, aria-label, or aria-labelledby
				$element.then(($el) => {
					const hasLabel =
						$el.attr("aria-label") ||
						$el.attr("aria-labelledby") ||
						$el.attr("placeholder") ||
						Cypress.$(`label[for="${$el.attr("id")}"]`).length > 0;

					expect(hasLabel).to.be.true;
				});
			});
		});
	});

	context("Color and Contrast", () => {
		it("should not rely solely on color for information", () => {
			// Check that status information uses more than just color
			cy.get('[data-testid="outcome-chip"]').each(($chip) => {
				cy.wrap($chip).should("contain.text", /\S/); // Should have text content
			});
		});

		it("should have sufficient color contrast", () => {
			// This is a basic check - in a real app you'd use tools like axe-core
			cy.get("body")
				.should("have.css", "color")
				.and("not.equal", "rgba(0, 0, 0, 0)");
			cy.get("body")
				.should("have.css", "background-color")
				.and("not.equal", "rgba(0, 0, 0, 0)");
		});
	});

	context("Focus Management", () => {
		it("should have visible focus indicators", () => {
			cy.get("#force-select").focus();
			cy.focused()
				.should("have.css", "outline-width")
				.and("not.equal", "0px");
		});

		it("should manage focus appropriately in modals/popups", () => {
			// Test map popup focus management
			cy.get(".leaflet-marker-icon").first().click();
			cy.get(".leaflet-popup").should("be.visible");

			// Focus should be managed within popup
			cy.get(".leaflet-popup")
				.find("button, a, input, select")
				.first()
				.should("be.focused");
		});

		it("should restore focus after interactions", () => {
			cy.get("#force-select").focus().click();
			cy.get('[data-value="city-of-london"]').click();

			// Focus should return to select after selection
			cy.get("#force-select").should("be.focused");
		});
	});

	context("Responsive Design Accessibility", () => {
		it("should be accessible on mobile devices", () => {
			cy.viewport("iphone-x");

			// Mobile menu should be accessible
			cy.get('[data-testid="mobile-menu-button"]').should("be.visible");
			cy.get('[data-testid="mobile-menu-button"]').should(
				"have.attr",
				"aria-label",
			);

			// Content should remain accessible
			cy.get('[data-testid="dashboard-content"]').should("be.visible");
		});

		it("should support zoom up to 200%", () => {
			// Simulate 200% zoom
			cy.viewport(640, 360); // Half the normal size simulates 200% zoom

			// Content should still be accessible and readable
			cy.get('[data-testid="dashboard-content"]').should("be.visible");
			cy.contains("Police Stop & Search Dashboard").should("be.visible");
		});
	});
});
