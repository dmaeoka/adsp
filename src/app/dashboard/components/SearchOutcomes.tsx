import React from "react";
import { useTheme } from "@mui/material/styles";
import dynamic from "next/dynamic";
import DashboardCard from "./DashboardCard";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SearchOutcomes = () => {
	// chart color
	const theme = useTheme();
	const primary = theme.palette.primary.main;
	const secondary = theme.palette.secondary.main;

	// chart
	const optionscolumnchart: any = {
		chart: {
			type: "bar",
			foreColor: "#adb0bb",
			toolbar: {
				show: true,
			},
			height: 330,
		},
		colors: [primary, secondary],
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: "60%",
				columnWidth: "50%",
				borderRadius: [1],
				borderRadiusApplication: "end",
				borderRadiusWhenStacked: "all",
			},
		},
		stroke: {
			show: true,
			width: 5,
			lineCap: "butt",
			colors: ["transparent"],
		},
		dataLabels: {
			enabled: false,
		},
		legend: {
			show: false,
		},
		grid: {
			borderColor: "rgba(0,0,0,0.1)",
			strokeDashArray: 3,
			xaxis: {
				lines: {
					show: false,
				},
			},
		},
		yaxis: {
			tickAmount: 4,
		},
		xaxis: {
			categories: ['A no further action disposal', 'Arrest', 'Community resolution', 'Penalty Notice for Disorder', 'Summons / charged by post'],
			axisBorder: {
				show: true,
			},
		},
		tooltip: {
			theme: "dark",
			fillSeriesColor: false,
		},
	};

	const seriescolumnchart: any = [
		{
			data: [400, 430, 448, 470, 540]
		},
	];


	return (
		<DashboardCard title="Search Outcomes">
			<Chart
				options={optionscolumnchart}
				series={seriescolumnchart}
				type="bar"
				height={380}
				width={"100%"}
			/>
		</DashboardCard>
	);
};

export default SearchOutcomes;
