describe("Police Dashboard", () => {
	beforeEach(() => {
		cy.mockPoliceAPI();
		cy.visit("/metropolitan");
	});

	describe("Page Load and Initial State", () => {
		it("should load the dashboard successfully", () => {
			cy.contains("Police Stop & Search Dashboard").should("be.visible");
			cy.get("#sidebar").should("be.visible");
			cy.get("#header").should("be.visible");
		});

		it("should display loading state initially", () => {
			cy.visit("/metropolitan");
			cy.get("#loading").should("be.visible");
			cy.waitForDashboardLoad();
			cy.get("#loading").should("not.exist");
		});

		it("should have correct page title and meta", () => {
			cy.title().should("include", "Dashboard");
		});
	});

	describe("Sidebar Navigation", () => {
		it("should display police force selector", () => {
			cy.get("#force-select").should("be.visible");
			cy.get("#force-select").should(
				"contain",
				"Metropolitan Police Service",
			);
		});

		it("should display month selector", () => {
			cy.get("#month-select").should("be.visible");
		});

		it("should allow changing police force", () => {
			cy.selectPoliceForce("city-of-london");
			cy.url().should("include", "/city-of-london");
		});

		it("should allow changing month", () => {
			cy.selectMonth("2024-01");
			cy.url().should("include", "date=2024-01");
		});

		it("should update dashboard when filters change", () => {
			cy.selectPoliceForce("surrey");
			cy.selectMonth("2024-01");

			// Check that API is called with new parameters
			cy.intercept("GET", "/api/police-data*").as("newPoliceData");
			cy.wait("@newPoliceData").then((interception) => {
				expect(interception.request.url).to.include("force=surrey");
				expect(interception.request.url).to.include("date=2024-01");
			});
		});
	});

	describe("Dashboard Statistics Cards", () => {
		beforeEach(() => {
			cy.waitForDashboardLoad();
		});

		it("should display all stats cards", () => {
			cy.contains("Total Stop & Searches").should("be.visible");
			cy.contains("Search Types").should("be.visible");
			cy.contains("Unique Outcomes").should("be.visible");
			cy.contains("Data Period").should("be.visible");
		});

		it("should show correct total count", () => {
			cy.contains("Total Stop & Searches")
				.parent()
				.should("contain", "3");
		});

		it("should show correct search types count", () => {
			cy.contains("Search Types").parent().should("contain", "2");
		});
	});

	describe("Charts and Visualizations", () => {
		beforeEach(() => {
			cy.waitForDashboardLoad();
			cy.waitForCharts();
		});

		it("should display gender distribution chart", () => {
			cy.contains("Gender Distribution").should("be.visible");
			cy.get("#gender-chart").should("be.visible");
		});

		it("should display age distribution chart", () => {
			cy.contains("Age Distribution").should("be.visible");
			cy.get("#age-chart").should("be.visible");
		});

		it("should display search types chart", () => {
			cy.contains("Search Types").should("be.visible");
			cy.get("#search-types-chart").should("be.visible");
		});

		it("should display search outcomes chart", () => {
			cy.contains("Search Outcomes").should("be.visible");
			cy.get("#outcomes-chart").should("be.visible");
		});

		it("should display ethnicity distribution chart", () => {
			cy.contains("Ethnicity Distribution").should("be.visible");
			cy.get("#ethnicity-chart").should("be.visible");
		});

		it("should show chart legends and data", () => {
			// Check that charts have data
			cy.get(".apexcharts-legend").should("exist");
			cy.get(".apexcharts-series").should("have.length.greaterThan", 0);
		});
	});

	describe("Data Table", () => {
		beforeEach(() => {
			cy.waitForDashboardLoad();
		});

		it("should display records table", () => {
			cy.contains("Stop & Search Records").should("be.visible");
			cy.get("#records-table").should("be.visible");
		});

		it("should show correct number of rows", () => {
			cy.get("#records-table tbody tr").should("have.length", 3);
		});

		it("should allow searching records", () => {
			cy.get('[placeholder="Search records..."]').type("Oxford Street");
			cy.get("#records-table tbody tr").should("have.length", 1);
			cy.get("#records-table").should("contain", "Oxford Street");
		});

		it("should show pagination controls", () => {
			cy.get("#table-pagination").should("be.visible");
			cy.contains("1–3 of 3").should("be.visible");
		});
	});

	describe("Map Component", () => {
		beforeEach(() => {
			cy.waitForDashboardLoad();
		});

		it("should display map container", () => {
			cy.contains("Stop & Search Locations").should("be.visible");
			cy.get(".leaflet-container").should("be.visible");
		});

		it("should display map legend", () => {
			cy.get("#map-legend").should("be.visible");
			cy.contains("Search Types").should("be.visible");
		});
	});

	describe("Responsive Design", () => {
		it("should work on mobile viewport", () => {
			cy.viewport("iphone-x");
			cy.visit("/metropolitan");
			cy.waitForDashboardLoad();

			// Check that mobile menu is visible
			cy.get("#mobile-menu-button").should("be.visible");

			// Check that content is responsive
			cy.get("#dashboard-content").should("be.visible");
		});

		it("should work on tablet viewport", () => {
			cy.viewport("ipad-2");
			cy.visit("/metropolitan");
			cy.waitForDashboardLoad();

			cy.get("#dashboard-content").should("be.visible");
			cy.get("#sidebar").should("be.visible");
		});
	});

	describe("Error Handling", () => {
		it("should handle API errors gracefully", () => {
			// Mock API error
			cy.intercept("GET", "/api/police-data*", { statusCode: 500 }).as(
				"apiError",
			);

			cy.visit("/metropolitan");
			cy.wait("@apiError");

			// Should show error state or empty state
			cy.contains("No data available").should("be.visible");
		});

		it("should handle empty data gracefully", () => {
			cy.mockPoliceAPI("empty-police-data");
			cy.visit("/metropolitan");
			cy.waitForDashboardLoad();

			cy.contains("No data available").should("be.visible");
			cy.contains("Total Stop & Searches")
				.parent()
				.should("contain", "0");
		});

		it("should handle network timeouts", () => {
			// Mock slow API
			cy.intercept("GET", "/api/police-data*", { delay: 30000 }).as(
				"slowApi",
			);

			cy.visit("/metropolitan");

			// Should show loading state for extended period
			cy.get("#loading", { timeout: 5000 }).should("be.visible");
		});
	});
});
