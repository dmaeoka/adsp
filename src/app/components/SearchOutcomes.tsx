import React from "react";
import { useTheme } from "@mui/material/styles";
import { Typography } from "@mui/material";
import dynamic from "next/dynamic";
import DashboardCard from "./DashboardCard";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartDataItem {
	name: string;
	value: number;
	percentage: number;
}

interface SearchOutcomesProps {
	data: ChartDataItem[];
}

const SearchOutcomes = ({ data }: SearchOutcomesProps) => {
	const theme = useTheme();
	const primary = theme.palette.primary.main;
	const secondary = theme.palette.secondary.main;

	// Show empty state if no data
	if (!data || data.length === 0) {
		return (
			<DashboardCard title="Search Outcomes">
				<Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
					No search outcome data available
				</Typography>
			</DashboardCard>
		);
	}

	// Chart configuration
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
			categories: data.map(item => item.name),
			axisBorder: {
				show: true,
			},
		},
		tooltip: {
			theme: theme.palette.mode === "dark" ? "dark" : "light",
			fillSeriesColor: false,
			y: {
				formatter: function(val: number, opts: any) {
					const percentage = data[opts.dataPointIndex]?.percentage || 0;
					return `${val.toLocaleString()} (${percentage}%)`;
				}
			}
		},
	};

	const seriescolumnchart: any = [
		{
			name: "Count",
			data: data.map(item => item.value)
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
