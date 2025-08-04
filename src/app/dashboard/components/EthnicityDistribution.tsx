import React from "react";
import { useTheme } from "@mui/material/styles";
import dynamic from "next/dynamic";
import DashboardCard from "./DashboardCard";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const EthnicityDistribution = () => {
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
			categories: ['Person search', 'Person and Vehicle search', 'Vehicle search'],
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
			data: [7308, 1621, 73]
		},
	];


	return (
		<DashboardCard title="Search Types">
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

export default EthnicityDistribution;
