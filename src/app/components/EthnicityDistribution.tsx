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

interface EthnicityDistributionProps {
	data: ChartDataItem[];
}

const EthnicityDistribution = ({ data }: EthnicityDistributionProps) => {
	const theme = useTheme();
	const colors = [
		theme.palette.primary.main,
		theme.palette.secondary.main,
		theme.palette.success.main,
		theme.palette.warning.main,
		theme.palette.error.main,
		theme.palette.info.main,
		"#FF6B6B",
		"#4ECDC4",
		"#45B7D1",
		"#96CEB4",
		"#FFEAA7",
		"#DDA0DD",
		"#98D8C8",
		"#989898",
		"#BB8FCE"
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
			<DashboardCard title="Ethnicity Distribution">
				<Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
					No ethnicity data available
				</Typography>
			</DashboardCard>
		);
	}

	return (
		<DashboardCard title="Ethnicity Distribution">
			<Grid container spacing={3}>
				<Grid size={{ xs: 12, sm: 8 }}>
					<Stack spacing={1} mt={2} direction="column" sx={{ maxHeight: 300, overflowY: "auto" }}>
						{data.map((item, index) => (
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
										minWidth: 80,
										fontSize: "0.75rem",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
									title={item.name}
								>
									{item.name}
								</Typography>
								<Chip
									sx={{
										backgroundColor: colors[index % colors.length],
										color: "#fff",
										fontSize: "0.7rem",
										height: 20,
										"& .MuiChip-label": {
											px: 1
										}
									}}
									size="small"
									label={`${item.value.toLocaleString()} (${item.percentage}%)`}
								/>
							</Stack>
						))}
					</Stack>
				</Grid>
				<Grid size={{ xs: 12, sm: 4 }}>
					{data.length > 0 && (
						<Chart
							options={optionscolumnchart}
							series={seriescolumnchart.slice(0, 8)} // Only show top 8 in chart
							type="donut"
							height={250}
							width={"100%"}
						/>
					)}
				</Grid>
			</Grid>
		</DashboardCard>
	);
};

export default EthnicityDistribution;
