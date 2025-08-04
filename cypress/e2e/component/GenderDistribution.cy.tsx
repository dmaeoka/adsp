// cypress/component/GenderDistribution.cy.tsx
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import GenderDistribution from "../../../src/app/components/GenderDistribution";
import { baselightTheme } from "../../../src/utils/theme/DefaultColors";

describe("GenderDistribution Component", () => {
	const mountWithTheme = (component: React.ReactElement) => {
		return cy.mount(
			<ThemeProvider theme={baselightTheme}>{component}</ThemeProvider>,
		);
	};

	const mockData = [
		{ name: "Male", value: 150, percentage: 60 },
		{ name: "Female", value: 75, percentage: 30 },
		{ name: "Not specified", value: 25, percentage: 10 },
	];

	it("should render with data", () => {
		mountWithTheme(<GenderDistribution data={mockData} />);

		cy.contains("Gender Distribution").should("be.visible");
		cy.get(".apexcharts-canvas").should("be.visible");
		cy.contains("Male").should("be.visible");
		cy.contains("Female").should("be.visible");
		cy.contains("150 (60%)").should("be.visible");
	});

	it("should show empty state when no data", () => {
		mountWithTheme(<GenderDistribution data={[]} />);

		cy.contains("Gender Distribution").should("be.visible");
		cy.contains("No gender data available").should("be.visible");
		cy.get(".apexcharts-canvas").should("not.exist");
	});

	it("should display all data items", () => {
		mountWithTheme(<GenderDistribution data={mockData} />);

		mockData.forEach((item) => {
			cy.contains(item.name).should("be.visible");
			cy.contains(
				`${item.value.toLocaleString()} (${item.percentage}%)`,
			).should("be.visible");
		});
	});

	it("should have correct chart configuration", () => {
		mountWithTheme(<GenderDistribution data={mockData} />);

		cy.get(".apexcharts-canvas").should("be.visible");
		cy.get(".apexcharts-pie").should("be.visible");
	});
});

// cypress/component/TableRecords.cy.tsx
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import TableRecords from "../../src/app/components/TableRecords";
import { baselightTheme } from "../../src/utils/theme/DefaultColors";

describe("TableRecords Component", () => {
	const mountWithTheme = (component: React.ReactElement) => {
		return cy.mount(
			<ThemeProvider theme={baselightTheme}>{component}</ThemeProvider>,
		);
	};

	const mockData = [
		{
			id: "1",
			datetime: "2024-01-15T14:30:00Z",
			type: "Person search",
			location: {
				street: { name: "Oxford Street" },
			},
			age_range: "18-24",
			gender: "Male",
			outcome: "No further action",
			object_of_search: "Controlled drugs",
			self_defined_ethnicity: "White - British",
		},
		{
			id: "2",
			datetime: "2024-01-16T10:20:00Z",
			type: "Vehicle search",
			location: {
				street: { name: "King's Cross Road" },
			},
			age_range: "25-34",
			gender: "Female",
			outcome: "Arrest",
			object_of_search: "Stolen goods",
			self_defined_ethnicity: "Black - African",
		},
	];

	it("should render table with data", () => {
		mountWithTheme(
			<TableRecords
				data={mockData}
				forceName="Metropolitan Police"
				month="January 2024"
			/>,
		);

		cy.contains("Stop & Search Records - Metropolitan Police").should(
			"be.visible",
		);
		cy.get("table").should("be.visible");
		cy.get("tbody tr").should("have.length", 2);
	});

	it("should show empty state when no data", () => {
		mountWithTheme(
			<TableRecords
				data={[]}
				forceName="Metropolitan Police"
				month="January 2024"
			/>,
		);

		cy.contains("Stop & Search Records - Metropolitan Police").should(
			"be.visible",
		);
		cy.contains("No records available for January 2024").should(
			"be.visible",
		);
	});

	it("should allow searching", () => {
		mountWithTheme(
			<TableRecords
				data={mockData}
				forceName="Metropolitan Police"
				month="January 2024"
			/>,
		);

		cy.get('input[placeholder="Search records..."]').type("Oxford");
		cy.get("tbody tr").should("have.length", 1);
		cy.contains("Oxford Street").should("be.visible");
	});

	it("should allow sorting", () => {
		mountWithTheme(
			<TableRecords
				data={mockData}
				forceName="Metropolitan Police"
				month="January 2024"
			/>,
		);

		// Click on Type column to sort
		cy.contains("Type").click();

		// Should see rows in sorted order
		cy.get("tbody tr").first().should("contain", "Person search");
	});

	it("should show pagination controls", () => {
		mountWithTheme(
			<TableRecords
				data={mockData}
				forceName="Metropolitan Police"
				month="January 2024"
			/>,
		);

		cy.get('[role="button"][aria-label*="page"]').should("exist");
		cy.contains("1–2 of 2").should("be.visible");
	});

	it("should display all table columns", () => {
		mountWithTheme(
			<TableRecords
				data={mockData}
				forceName="Metropolitan Police"
				month="January 2024"
			/>,
		);

		// Check headers
		const expectedHeaders = [
			"Date",
			"Type",
			"Location",
			"Age",
			"Gender",
			"Outcome",
			"Object of Search",
		];
		expectedHeaders.forEach((header) => {
			cy.contains("th", header).should("be.visible");
		});
	});

	it("should format dates correctly", () => {
		mountWithTheme(
			<TableRecords
				data={mockData}
				forceName="Metropolitan Police"
				month="January 2024"
			/>,
		);

		cy.contains("15/01/2024").should("be.visible");
		cy.contains("16/01/2024").should("be.visible");
	});
});
