"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Grid, Box, Typography, CircularProgress } from "@mui/material";
import { usePoliceForce } from "../contexts/PoliceForceContext";

// Components
import StatsCard from "./StatsCard";
import GenderDistribution from "./GenderDistribution";
import AgeDistribution from "./AgeDistribution";
import EthnicityDistribution from "./EthnicityDistribution";
import SearchTypes from "./SearchTypes";
import SearchOutcomes from "./SearchOutcomes";
import TableRecords from "./TableRecords";
import PoliceMap from "./PoliceMap";

interface StopSearchRecord {
	id?: string;
	datetime: string;
	type: string;
	location?: {
		street?: {
			name?: string;
		};
	};
	age_range?: string | null;
	gender?: string | null;
	outcome?: string | null;
	object_of_search?: string | null;
	self_defined_ethnicity?: string | null;
}

interface ChartDataItem {
	name: string;
	value: number;
	percentage: number;
}

interface StatsData {
	total: number;
	searchTypes: ChartDataItem[];
	outcomes: ChartDataItem[];
	demographics: {
		ageRange: ChartDataItem[];
		gender: ChartDataItem[];
		ethnicity: ChartDataItem[];
	};
}

interface CacheData {
	data: StopSearchRecord[];
	stats: StatsData;
}

// Add props interface for the component
interface PoliceDataDashboardProps {
	initialParams?: {
		params: {
			force: string;
		};
		searchParams: {
			date?: string;
		};
	};
}

// Separate component that uses useSearchParams
function DashboardContent({ initialParams }: PoliceDataDashboardProps) {
	const searchParams = useSearchParams();
	const pathname = usePathname();

	// Use context instead of local state and API calls
	const {
		forces,
		isLoadingForces,
		selectedForce,
		selectedMonth,
		setSelectedForce,
		setSelectedMonth,
		getCurrentForceName,
		getFormattedMonth,
	} = usePoliceForce();

	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<StopSearchRecord[]>([]);
	const [dataCache, setDataCache] = useState<Map<string, CacheData>>(
		new Map(),
	);

	const [stats, setStats] = useState<StatsData>({
		total: 0,
		searchTypes: [],
		outcomes: [],
		demographics: {
			ageRange: [],
			gender: [],
			ethnicity: [],
		},
	});

	// Parse URL parameters and sync with context - UPDATED FOR NEW STRUCTURE
	const parseURLParams = useCallback(() => {
		const pathParts = pathname.split("/");
		const forceFromPath = pathParts[1] || "metropolitan";
		const dateFromParams = searchParams.get("date") || "";

		return {
			force: forceFromPath,
			date: dateFromParams,
		};
	}, [pathname, searchParams]);

	// Initialize state from URL and sync with context
	useEffect(() => {
		const urlParams = parseURLParams();

		// Only update if different to avoid unnecessary re-renders
		if (urlParams.force !== selectedForce) {
			setSelectedForce(urlParams.force);
		}
		if (urlParams.date !== selectedMonth) {
			setSelectedMonth(urlParams.date);
		}
	}, [
		parseURLParams,
		selectedForce,
		selectedMonth,
		setSelectedForce,
		setSelectedMonth,
	]);

	const fetchData = useCallback(
		async (month: string, force: string) => {
			if (!month || !force) {
				setData([]);
				setStats({
					total: 0,
					searchTypes: [],
					outcomes: [],
					demographics: { ageRange: [], gender: [], ethnicity: [] },
				});
				return;
			}

			const cacheKey = `${force}-${month}`;

			if (dataCache.has(cacheKey)) {
				const cachedData = dataCache.get(cacheKey);
				if (cachedData) {
					setData(cachedData.data);
					setStats(cachedData.stats);
					return;
				}
			}

			setIsLoading(true);

			try {
				const response = await fetch(
					`/api/police-data?date=${month}&force=${force}`,
				);

				if (!response.ok) {
					throw new Error(`Failed to fetch data: ${response.status}`);
				}

				const result: { error?: string; data?: StopSearchRecord[] } =
					await response.json();

				if (result.error) {
					throw new Error(result.error);
				}

				const records = result.data || [];
				setData(records);

				const newStats = generateStats(records);
				setStats(newStats);

				setDataCache((prev) =>
					new Map(prev).set(cacheKey, {
						data: records,
						stats: newStats,
					}),
				);
			} catch (err) {
				console.error("Error fetching data:", err);
				setData([]);
				setStats({
					total: 0,
					searchTypes: [],
					outcomes: [],
					demographics: { ageRange: [], gender: [], ethnicity: [] },
				});
			} finally {
				setIsLoading(false);
			}
		},
		[dataCache],
	);

	const generateStats = (records: StopSearchRecord[]): StatsData => {
		const total = records.length;

		if (total === 0) {
			return {
				total: 0,
				searchTypes: [],
				outcomes: [],
				demographics: { ageRange: [], gender: [], ethnicity: [] },
			};
		}

		// Count search types
		const typeCount = records.reduce(
			(acc: Record<string, number>, record) => {
				const type = record.type || "Unknown";
				acc[type] = (acc[type] || 0) + 1;
				return acc;
			},
			{},
		);

		const searchTypes = Object.entries(typeCount)
			.map(([name, value]) => ({
				name,
				value,
				percentage: Math.round((value / total) * 100),
			}))
			.sort((a, b) => b.value - a.value);

		// Count outcomes
		const outcomeCount = records.reduce(
			(acc: Record<string, number>, record) => {
				const outcome = record.outcome || "Unknown";
				acc[outcome] = (acc[outcome] || 0) + 1;
				return acc;
			},
			{},
		);

		const outcomes = Object.entries(outcomeCount)
			.map(([name, value]) => ({
				name,
				value,
				percentage: Math.round((value / total) * 100),
			}))
			.sort((a, b) => b.value - a.value);

		// Demographics
		const ageCount = records.reduce(
			(acc: Record<string, number>, record) => {
				const age = record.age_range || "Not specified";
				acc[age] = (acc[age] || 0) + 1;
				return acc;
			},
			{},
		);

		const genderCount = records.reduce(
			(acc: Record<string, number>, record) => {
				const gender = record.gender || "Not specified";
				acc[gender] = (acc[gender] || 0) + 1;
				return acc;
			},
			{},
		);

		const ethnicityCount = records.reduce(
			(acc: Record<string, number>, record) => {
				const ethnicity =
					record.self_defined_ethnicity || "Not specified";
				acc[ethnicity] = (acc[ethnicity] || 0) + 1;
				return acc;
			},
			{},
		);

		return {
			total,
			searchTypes,
			outcomes,
			demographics: {
				ageRange: Object.entries(ageCount)
					.map(([name, value]) => ({
						name,
						value,
						percentage: Math.round((value / total) * 100),
					}))
					.sort((a, b) => b.value - a.value),
				gender: Object.entries(genderCount)
					.map(([name, value]) => ({
						name,
						value,
						percentage: Math.round((value / total) * 100),
					}))
					.sort((a, b) => b.value - a.value),
				ethnicity: Object.entries(ethnicityCount)
					.map(([name, value]) => ({
						name,
						value,
						percentage: Math.round((value / total) * 100),
					}))
					.sort((a, b) => b.value - a.value),
			},
		};
	};

	// Watch for changes in selectedForce and selectedMonth from context
	useEffect(() => {
		if (selectedMonth && selectedForce && !isLoadingForces) {
			fetchData(selectedMonth, selectedForce);
		}
	}, [selectedForce, selectedMonth, isLoadingForces, fetchData]);

	// Show loading state (either forces loading or data loading)
	if (isLoadingForces || isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="400px"
			>
				<Box textAlign="center">
					<CircularProgress size={48} sx={{ mb: 2 }} />
					<Typography variant="h6" color="text.secondary">
						{isLoadingForces
							? "Loading police forces..."
							: `Loading ${getCurrentForceName()} data for ${getFormattedMonth()}...`}
					</Typography>
				</Box>
			</Box>
		);
	}

	// Show empty state
	const showEmptyState =
		!selectedMonth || !selectedForce || stats.total === 0;

	if (showEmptyState) {
		return (
			<Box textAlign="center" py={8}>
				<Typography variant="h6" color="text.secondary" gutterBottom>
					{!selectedMonth || !selectedForce
						? "Please select a police force and month"
						: "No data available"}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{!selectedMonth || !selectedForce
						? "Use the sidebar to select a police force and month to view stop and search data."
						: `No stop and search records found for ${getCurrentForceName()} in ${getFormattedMonth()}.`}
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			<Grid container spacing={3}>
				<Grid size={{ xs: 6, lg: 3 }}>
					<StatsCard
						title="Total Stop & Searches"
						value={stats.total.toLocaleString()}
					/>
				</Grid>
				<Grid size={{ xs: 6, lg: 3 }}>
					<StatsCard
						title="Search Types"
						value={stats.searchTypes.length.toString()}
					/>
				</Grid>
				<Grid size={{ xs: 6, lg: 3 }}>
					<StatsCard
						title="Unique Outcomes"
						value={stats.outcomes.length.toString()}
					/>
				</Grid>
				<Grid size={{ xs: 6, lg: 3 }}>
					<StatsCard
						title="Data Period"
						value={getFormattedMonth()}
					/>
				</Grid>

				<Grid size={{ xs: 12, lg: 4 }}>
					<GenderDistribution data={stats.demographics.gender} />
				</Grid>

				<Grid size={{ xs: 12, lg: 4 }}>
					<AgeDistribution data={stats.demographics.ageRange} />
				</Grid>

				<Grid size={{ xs: 12, lg: 4 }}>
					<SearchTypes data={stats.searchTypes} />
				</Grid>

				<Grid size={{ xs: 12 }}>
					<SearchOutcomes data={stats.outcomes} />
				</Grid>

				<Grid size={{ xs: 12 }}>
					<EthnicityDistribution
						data={stats.demographics.ethnicity}
					/>
				</Grid>

				<Grid size={{ xs: 12 }}>
					<TableRecords
						data={data}
						forceName={getCurrentForceName()}
						month={getFormattedMonth()}
					/>
				</Grid>

				<Grid size={{ xs: 12 }}>
					<PoliceMap
						data={data}
						forceName={getCurrentForceName()}
						month={getFormattedMonth()}
					/>
				</Grid>

			</Grid>
		</Box>
	);
}

// Loading fallback component
function DashboardFallback() {
	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			minHeight="400px"
		>
			<Box textAlign="center">
				<CircularProgress size={48} sx={{ mb: 2 }} />
				<Typography variant="h6" color="text.secondary">
					Loading dashboard...
				</Typography>
			</Box>
		</Box>
	);
}

// Main dashboard component with Suspense wrapper
export default function PoliceDataDashboard({
	initialParams,
}: PoliceDataDashboardProps) {
	return (
		<Suspense fallback={<DashboardFallback />}>
			<DashboardContent initialParams={initialParams} />
		</Suspense>
	);
}
