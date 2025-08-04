// cypress/component/StatsCard.cy.tsx
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import StatsCard from "../../../src/app/components/StatsCard";
import { baselightTheme } from "../../../src/utils/theme/DefaultColors";

describe("StatsCard Component", () => {
	const mountWithTheme = (component: React.ReactElement) => {
		return cy.mount(
			<ThemeProvider theme={baselightTheme}>{component}</ThemeProvider>,
		);
	};

	it("should render with title and value", () => {
		mountWithTheme(<StatsCard title="Total Records" value="1,234" />);

		cy.contains("Total Records").should("be.visible");
		cy.contains("1,234").should("be.visible");
	});

	it("should handle long titles gracefully", () => {
		mountWithTheme(
			<StatsCard
				title="Very Long Title That Might Overflow The Card"
				value="999"
			/>,
		);

		cy.contains("Very Long Title").should("be.visible");
		cy.contains("999").should("be.visible");
	});

	it("should handle large numbers", () => {
		mountWithTheme(
			<StatsCard title="Large Number" value="1,234,567,890" />,
		);

		cy.contains("1,234,567,890").should("be.visible");
	});
});
