"use client";
import { Grid, Box } from "@mui/material";
// components
import SearchTypes from "./SearchTypes";
import StatsCard from "./StatsCard";
import GenderDistribution from "./GenderDistribution";
import AgeDistribution from './AgeDistribution';
import TableRecords from "./TableRecords";
import SearchOutcomes from "./SearchOutcomes";

// Main dashboard component
export default function PoliceDataDashboard() {
	return (
		<Box>
			<Grid container spacing={3}>
				<Grid
					size={{
						xs: 6,
						lg: 3,
					}}
				>
					<StatsCard title="Total Stop & Searches" value="10,688" trend="info" trendValue="25%" />
				</Grid>
				<Grid
					size={{
						xs: 6,
						lg: 3,
					}}
				>
					<StatsCard title="Search Types" value="10,688" trend="info" trendValue="25%" />
				</Grid>
				<Grid
					size={{
						xs: 6,
						lg: 3,
					}}
				>
					<StatsCard title="Unique Outcomes" value="10,688" />
				</Grid>
				<Grid
					size={{
						xs: 6,
						lg: 3,
					}}
				>
					<StatsCard title="Data Period" value="10,688" />
				</Grid>

				<Grid
					size={{
						xs: 12,
						lg: 6,
					}}
				>
					<GenderDistribution />
				</Grid>

				<Grid
					size={{
						xs: 12,
						lg: 6,
					}}
				>
					<AgeDistribution />
				</Grid>
				<Grid
					size={{
						xs: 12,
						lg: 6,
					}}
				>
					<SearchTypes />
				</Grid>
				<Grid
					size={{
						xs: 12,
						lg: 6,
					}}
				>
					<SearchOutcomes />
				</Grid>
				<Grid
					size={{
						xs: 12,
					}}
				>
					<TableRecords />
				</Grid>
			</Grid>
		</Box>
	);
}
