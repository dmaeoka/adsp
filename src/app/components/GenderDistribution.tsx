import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar, Chip } from "@mui/material";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import DashboardCard from "./DashboardCard";

interface ChartDataItem {
	name: string;
	value: number;
	percentage: number;
}

interface GenderDistributionProps {
	data: ChartDataItem[];
}

const GenderDistribution = ({ data }: GenderDistributionProps) => {
	const theme = useTheme();
	const colors = [
		theme.palette.primary.main,
		theme.palette.secondary.main,
		theme.palette.success.main,
		theme.palette.warning.main,
		theme.palette.error.main,
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
	const seriescolumnchart = data.map((item) => item.value);

	// Show empty state if no data
	if (!data || data.length === 0) {
		return (
			<DashboardCard title="Gender Distribution">
				<Typography
					variant="body2"
					color="text.secondary"
					textAlign="center"
					py={4}
				>
					No gender data available
				</Typography>
			</DashboardCard>
		);
	}

	return (
		<DashboardCard title="Gender Distribution">
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
						{data.slice(0, 5).map((item, index) => (
							<Stack
								key={item.name}
								direction="row"
								spacing={1}
								alignItems="center"
							>
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
									sx={{ minWidth: 60 }}
								>
									{item.name}
								</Typography>
								<Chip
									sx={{
										backgroundColor:
											colors[index % colors.length],
										color: "#fff",
										fontSize: "0.75rem",
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

export default GenderDistribution;
