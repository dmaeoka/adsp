import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
import { Grid, Stack, Typography, Avatar, Chip } from "@mui/material";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import DashboardCard from "./DashboardCard";

const AgeDistribution = () => {
	const theme = useTheme();
	const primary = theme.palette.primary.main;
	const colors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main]
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
	const seriescolumnchart: any = [26, 24, 20, 17, 12];

	return (
		<DashboardCard title="Age Distribution">
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
									bgcolor: colors[0],
									svg: { display: "none" },
								}}
							></Avatar>
							<Typography
								variant="subtitle2"
								color="textSecondary"
							>
								over 34
							</Typography>
							<Chip
								sx={{
									backgroundColor: colors[0],
									color: "#fff",
								}}
								size="small"
								label={`2,798`} />
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Avatar
								sx={{
									width: 9,
									height: 9,
									bgcolor: colors[1],
									svg: { display: "none" },
								}}
							></Avatar>
							<Typography
								variant="subtitle2"
								color="textSecondary"
							>
								18-24
							</Typography>
							<Chip
								sx={{
									backgroundColor: colors[1],
								}}
								size="small"
								label={`2,590`} />
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Avatar
								sx={{
									width: 9,
									height: 9,
									bgcolor: colors[2],
									svg: { display: "none" },
								}}
							></Avatar>
							<Typography
								variant="subtitle2"
								color="textSecondary"
							>
								25-34
							</Typography>
							<Chip
								sx={{
									backgroundColor: colors[2],
								}}
								size="small"
								label={`2,188`} />
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Avatar
								sx={{
									width: 9,
									height: 9,
									bgcolor: colors[3],
									svg: { display: "none" },
								}}
							></Avatar>
							<Typography
								variant="subtitle2"
								color="textSecondary"
							>
								10-17
							</Typography>
							<Chip
								sx={{
									backgroundColor: colors[3],
								}}
								size="small"
								label={`1,839`} />
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Avatar
								sx={{
									width: 9,
									height: 9,
									bgcolor: colors[4],
									svg: { display: "none" },
								}}
							></Avatar>
							<Typography
								variant="subtitle2"
								color="textSecondary"
							>
								Not specified
							</Typography>
							<Chip
								sx={{
									backgroundColor: colors[4],
								}}
								size="small"
								label={`1,261`} />
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

export default AgeDistribution;
