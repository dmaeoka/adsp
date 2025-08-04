import React from "react";
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar, Chip } from "@mui/material";
import dynamic from "next/dynamic";
import DashboardCard from "./DashboardCard";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartDataItem {
	name: string;
	value: number;
	percentage: number;
}

interface SearchTypesProps {
	data: ChartDataItem[];
}

const SearchTypes = ({ data }: SearchTypesProps) => {
	const theme = useTheme();
	const colors = [
		theme.palette.primary.main,
		theme.palette.secondary.main,
		theme.palette.success.main,
		theme.palette.warning.main,
		theme.palette.error.main,
		theme.palette.info.main
	];

	// Chart options
	const optionscolumnchart: any = {
		chart: {
			type: "donut",
			foreColor: "#adb0bb",
			toolbar: {
				show: false,
			},
			height: 155,
		},
		colors,
		plotOptions: {
			pie: {
				startAngle: 0,
				endAngle: 360,
				donut: {
					size: "75%",
					background: "transparent",
				},
			},
		},
		tooltip: {
			theme: theme.palette.mode === "dark" ? "dark" : "light",
			fillSeriesColor: false,
			y: {
				formatter: function(val: number, opts: any) {
					const percentage = data[opts.seriesIndex]?.percentage || 0;
					return `${val.toLocaleString()} (${percentage}%)`;
				}
			}
		},
		stroke: {
			show: false,
		},
		dataLabels: {
			enabled: false,
		},
		legend: {
			show: false,
		},
		responsive: [
			{
				breakpoint: 991,
				options: {
					chart: {
						width: 120,
					},
				},
			},
		],
	};

	// Prepare series data for chart
	const seriescolumnchart = data.map(item => item.value);

	// Show empty state if no data
	if (!data || data.length === 0) {
		return (
			<DashboardCard title="Search Types">
				<Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
					No search type data available
				</Typography>
			</DashboardCard>
		);
	}

	return (
		<DashboardCard title="Search Types">
			<Grid container spacing={3}>
				<Grid size={{ xs: 12 }}>
					<Chart
						options={optionscolumnchart}
						series={seriescolumnchart}
						type="donut"
						height={150}
						width={"100%"}
					/>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Stack spacing={1} mt={5} direction="column">
						{data.slice(0, 6).map((item, index) => (
							<Stack key={item.name} direction="row" spacing={1} alignItems="center">
								<Avatar
									sx={{
										width: 9,
										height: 9,
										bgcolor: colors[index % colors.length],
										svg: { display: "none" },
									}}
								></Avatar>
								<Typography
									variant="subtitle2"
									color="textSecondary"
									sx={{
										minWidth: 100,
										fontSize: "0.75rem",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap"
									}}
									title={item.name}
								>
									{item.name}
								</Typography>
								<Chip
									sx={{
										backgroundColor: colors[index % colors.length],
										color: "#fff",
										fontSize: "0.75rem"
									}}
									size="small"
									label={`${item.value.toLocaleString()} (${item.percentage}%)`}
								/>
							</Stack>
						))}
					</Stack>
				</Grid>
			</Grid>
		</DashboardCard>
	);
};

export default SearchTypes;
