import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar } from "@mui/material";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import DashboardCard from "./DashboardCard";

const GenderDistribution = () => {
	// chart color
	const theme = useTheme();
	const primary = theme.palette.primary.main;
	const primarylight = "#ecf2ff";

	// chart
	const optionscolumnchart: any = {
		chart: {
			type: "donut",
			foreColor: "#adb0bb",
			toolbar: {
				show: false,
			},
			height: 155,
		},
		colors: [primary, primarylight, "#F9F9FD"],
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
	const seriescolumnchart: any = [38, 40, 25];

	return (
		<DashboardCard title="Gender Distribution">
			<Grid container spacing={3}>
				<Grid
					size={{
						xs: 6,
						sm: 6,
					}}
				>
					<Stack spacing={1} mt={5} direction="column">
						<Stack direction="row" spacing={1} alignItems="center">
							<Avatar
								sx={{
									width: 9,
									height: 9,
									bgcolor: primary,
									svg: { display: "none" },
								}}
							></Avatar>
							<Typography
								variant="subtitle2"
								color="textSecondary"
							>
								Male
							</Typography>
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Avatar
								sx={{
									width: 9,
									height: 9,
									bgcolor: primarylight,
									svg: { display: "none" },
								}}
							></Avatar>
							<Typography
								variant="subtitle2"
								color="textSecondary"
							>
								Female
							</Typography>
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Avatar
								sx={{
									width: 9,
									height: 9,
									bgcolor: primarylight,
									svg: { display: "none" },
								}}
							></Avatar>
							<Typography
								variant="subtitle2"
								color="textSecondary"
							>
								Other
							</Typography>
						</Stack>
					</Stack>
				</Grid>
				<Grid
					size={{
						xs: 6,
					}}
				>
					<Chart
						options={optionscolumnchart}
						series={seriescolumnchart}
						type="donut"
						height={150}
						width={"100%"}
					/>
				</Grid>
			</Grid>
		</DashboardCard>
	);
};

export default GenderDistribution;
