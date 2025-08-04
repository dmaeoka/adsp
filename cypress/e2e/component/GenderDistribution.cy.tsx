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
