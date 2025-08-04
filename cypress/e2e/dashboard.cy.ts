describe("Police Dashboard", () => {
	beforeEach(() => {
		cy.mockPoliceAPI();
		cy.visit("/metropolitan");
	});

	describe("Page Load and Initial State", () => {
		it("should load the dashboard successfully", () => {
			cy.contains("Police Stop & Search Dashboard").should("be.visible");
			cy.wait(1000);
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
			cy.wait(2000);
			cy.get("#force-select").click();
			cy.wait(500);
			cy.get(".MuiMenuItem-root")
				.contains("City of London Police")
				.click();
			cy.url().should("include", "/city-of-london");
		});

		it("should allow changing month", () => {
			cy.wait(2000);
			cy.get("#month-select").click();
			cy.wait(500);
			cy.get(".MuiMenuItem-root").first().click();
			cy.url().should("include", "date=");
		});

		it("should update dashboard when filters change", () => {
			cy.wait(2000);
			cy.intercept("GET", "/api/police-data*").as("newPoliceData");

			cy.get("#force-select").click();
			cy.wait(500);
			cy.get(".MuiMenuItem-root").contains("Surrey Police").click();

			cy.wait("@newPoliceData").then((interception) => {
				expect(interception.request.url).to.include("force=surrey");
			});
		});
	});

	describe("Dashboard Statistics Cards", () => {
		beforeEach(() => {
			cy.wait(3000);
		});

		it("should display all stats cards", () => {
			cy.contains("Total Stop & Searches").should("be.visible");
			cy.contains("Search Types").should("be.visible");
			cy.contains("Unique Outcomes").should("be.visible");
			cy.contains("Data Period").should("be.visible");
		});
	});

	describe("Charts and Visualizations", () => {
		beforeEach(() => {
			cy.wait(5000);
		});

		it("should display gender distribution chart", () => {
			cy.contains("Gender Distribution").should("be.visible");
			cy.get(".apexcharts-canvas").should("exist");
		});

		it("should display age distribution chart", () => {
			cy.contains("Age Distribution").should("be.visible");
		});

		it("should display search types chart", () => {
			cy.contains("Search Types").should("be.visible");
		});

		it("should display search outcomes chart", () => {
			cy.contains("Search Outcomes").should("be.visible");
		});

		it("should display ethnicity distribution chart", () => {
			cy.contains("Ethnicity Distribution").should("be.visible");
		});

		it("should show chart data", () => {
			cy.get(".apexcharts-canvas").should("have.length.greaterThan", 0);
		});
	});

	describe("Data Table", () => {
		beforeEach(() => {
			cy.wait(3000);
		});

		it("should display records table", () => {
			cy.contains("Stop & Search Records").should("be.visible");
			cy.get("table").should("be.visible");
		});

		it("should show table data", () => {
			cy.get("table tbody").should("exist");
		});

		it("should allow searching records", () => {
			cy.get('[placeholder="Search records..."]')
				.should("be.visible")
				.clear()
				.type("test");
		});

		it("should show pagination controls", () => {
			cy.contains(/\d+–\d+ of \d+/).should("be.visible");
		});
	});

	describe("Map Component", () => {
		beforeEach(() => {
			cy.wait(3000);
		});

		it("should display map container", () => {
			cy.contains("Stop & Search Locations").should("be.visible");
			cy.get(".leaflet-container").should("be.visible");
		});

		it("should display map legend", () => {
			cy.contains("Search Types").should("be.visible");
		});
	});

	describe("Responsive Design", () => {
		it("should work on mobile viewport", () => {
			cy.viewport("iphone-x");
			cy.visit("/metropolitan");
			cy.wait(3000);
			cy.contains("Police Stop & Search Dashboard").should("be.visible");
		});

		it("should work on tablet viewport", () => {
			cy.viewport("ipad-2");
			cy.visit("/metropolitan");
			cy.wait(3000);

			cy.contains("Police Stop & Search Dashboard").should("be.visible");
		});
	});

	describe("Error Handling", () => {
		it("should handle API errors gracefully", () => {
			cy.intercept("GET", "/api/police-data*", { statusCode: 500 }).as(
				"apiError",
			);

			cy.visit("/metropolitan");
			cy.wait("@apiError");
			cy.contains("No data available").should("be.visible");
		});

		it("should handle network timeouts", () => {
			cy.intercept("GET", "/api/police-data*", { delay: 5000 }).as(
				"slowApi",
			);

			cy.visit("/metropolitan");

			cy.contains("Police Stop & Search Dashboard").should("be.visible");
		});
	});
});
