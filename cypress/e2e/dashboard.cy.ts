// cypress/e2e/dashboard.cy.ts
describe("Police Dashboard", () => {
	beforeEach(() => {
		// Mock API responses
		cy.mockPoliceAPI();

		// Visit the dashboard
		cy.visit("/metropolitan");
	});

	describe("Page Load and Initial State", () => {
		it("should load the dashboard successfully", () => {
			cy.contains("Police Stop & Search Dashboard").should("be.visible");
			cy.get('[data-testid="sidebar"]').should("be.visible");
			cy.get('[data-testid="header"]').should("be.visible");
		});

		it("should display loading state initially", () => {
			cy.visit("/metropolitan");
			cy.get('[data-testid="loading"]').should("be.visible");
			cy.waitForDashboardLoad();
			cy.get('[data-testid="loading"]').should("not.exist");
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
			cy.get('[data-testid="gender-chart"]').should("be.visible");
		});

		it("should display age distribution chart", () => {
			cy.contains("Age Distribution").should("be.visible");
			cy.get('[data-testid="age-chart"]').should("be.visible");
		});

		it("should display search types chart", () => {
			cy.contains("Search Types").should("be.visible");
			cy.get('[data-testid="search-types-chart"]').should("be.visible");
		});

		it("should display search outcomes chart", () => {
			cy.contains("Search Outcomes").should("be.visible");
			cy.get('[data-testid="outcomes-chart"]').should("be.visible");
		});

		it("should display ethnicity distribution chart", () => {
			cy.contains("Ethnicity Distribution").should("be.visible");
			cy.get('[data-testid="ethnicity-chart"]').should("be.visible");
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
			cy.get('[data-testid="records-table"]').should("be.visible");
		});

		it("should show correct number of rows", () => {
			cy.get('[data-testid="records-table"] tbody tr').should(
				"have.length",
				3,
			);
		});

		it("should allow searching records", () => {
			cy.get('[placeholder="Search records..."]').type("Oxford Street");
			cy.get('[data-testid="records-table"] tbody tr').should(
				"have.length",
				1,
			);
			cy.get('[data-testid="records-table"]').should(
				"contain",
				"Oxford Street",
			);
		});

		it("should allow sorting by columns", () => {
			// Click on Date column header to sort
			cy.contains("Date").click();

			// Verify sorting (dates should be in order)
			cy.get('[data-testid="records-table"] tbody tr')
				.first()
				.should("contain", "15/01/2024");
		});

		it("should show pagination controls", () => {
			cy.get('[data-testid="table-pagination"]').should("be.visible");
			cy.contains("1–3 of 3").should("be.visible");
		});

		it("should allow changing rows per page", () => {
			cy.get('[data-testid="rows-per-page-select"]').click();
			cy.get('[data-value="25"]').click();
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

		it("should show markers on map", () => {
			cy.get(".leaflet-marker-icon").should("have.length.greaterThan", 0);
		});

		it("should display map legend", () => {
			cy.get('[data-testid="map-legend"]').should("be.visible");
			cy.contains("Search Types").should("be.visible");
		});

		it("should show marker popups on click", () => {
			cy.get(".leaflet-marker-icon").first().click();
			cy.get(".leaflet-popup").should("be.visible");
			cy.get(".leaflet-popup").should("contain", "Stop & Search Record");
		});
	});

	describe("Responsive Design", () => {
		it("should work on mobile viewport", () => {
			cy.viewport("iphone-x");
			cy.visit("/metropolitan");
			cy.waitForDashboardLoad();

			// Check that mobile menu is visible
			cy.get('[data-testid="mobile-menu-button"]').should("be.visible");

			// Check that content is responsive
			cy.get('[data-testid="dashboard-content"]').should("be.visible");
		});

		it("should work on tablet viewport", () => {
			cy.viewport("ipad-2");
			cy.visit("/metropolitan");
			cy.waitForDashboardLoad();

			cy.get('[data-testid="dashboard-content"]').should("be.visible");
			cy.get('[data-testid="sidebar"]').should("be.visible");
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
			cy.get('[data-testid="loading"]', { timeout: 5000 }).should(
				"be.visible",
			);
		});
	});
});
