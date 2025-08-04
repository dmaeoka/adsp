"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Grid, Box, Typography, CircularProgress } from "@mui/material";

// Components
import StatsCard from "./StatsCard";
import GenderDistribution from "./GenderDistribution";
import AgeDistribution from './AgeDistribution';
import EthnicityDistribution from './EthnicityDistribution';
import SearchTypes from "./SearchTypes";
import SearchOutcomes from "./SearchOutcomes";
import TableRecords from "./TableRecords";

interface PoliceForce {
	id: string;
	name: string;
}

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
			page?: string;
			limit?: string;
			sort?: string;
			sortBy?: string;
			search?: string;
		};
	};
}

// Main dashboard component
export default function PoliceDataDashboard({ initialParams }: PoliceDataDashboardProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const [isLoading, setIsLoading] = useState(false);
	const [data, setData] = useState<StopSearchRecord[]>([]);
	const [forces, setForces] = useState<PoliceForce[]>([]);
	const [dataCache, setDataCache] = useState<Map<string, CacheData>>(new Map());

	// URL-synced state
	const [selectedMonth, setSelectedMonth] = useState("");
	const [selectedForce, setSelectedForce] = useState("metropolitan");

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

	// Parse URL parameters
	const parseURLParams = useCallback(() => {
		const pathParts = pathname.split("/");
		const forceFromPath = pathParts[2] || "metropolitan";
		const dateFromParams = searchParams.get("date") || "";

		return {
			force: forceFromPath,
			date: dateFromParams,
		};
	}, [pathname, searchParams]);

	// Initialize state from URL
	useEffect(() => {
		const urlParams = parseURLParams();
		setSelectedForce(urlParams.force);
		setSelectedMonth(urlParams.date);
	}, [parseURLParams]);

	// Fetch available police forces
	const fetchForces = async () => {
		try {
			const response = await fetch("https://data.police.uk/api/forces");

			if (!response.ok) {
				throw new Error(`Failed to fetch forces: ${response.status}`);
			}

			const forcesData: PoliceForce[] = await response.json();
			const sortedForces = forcesData
				.map((force) => ({
					id: force.id,
					name: force.name,
				}))
				.sort((a: PoliceForce, b: PoliceForce) =>
					a.name.localeCompare(b.name),
				);

			setForces(sortedForces);
		} catch (err) {
			console.error("Error fetching forces:", err);
			setForces([
				{ id: "metropolitan", name: "Metropolitan Police Service" },
			]);
		}
	};

	const fetchData = useCallback(async (month: string, force: string) => {
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

			const result: { error?: string; data?: StopSearchRecord[] } = await response.json();

			if (result.error) {
				throw new Error(result.error);
			}

			const records = result.data || [];
			setData(records);

			const newStats = generateStats(records);
			setStats(newStats);

			setDataCache((prev) =>
				new Map(prev).set(cacheKey, { data: records, stats: newStats }),
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
	}, [dataCache]);

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
		const typeCount = records.reduce((acc: Record<string, number>, record) => {
			const type = record.type || "Unknown";
			acc[type] = (acc[type] || 0) + 1;
			return acc;
		}, {});

		const searchTypes = Object.entries(typeCount)
			.map(([name, value]) => ({
				name,
				value,
				percentage: Math.round((value / total) * 100),
			}))
			.sort((a, b) => b.value - a.value);

		// Count outcomes
		const outcomeCount = records.reduce((acc: Record<string, number>, record) => {
			const outcome = record.outcome || "Unknown";
			acc[outcome] = (acc[outcome] || 0) + 1;
			return acc;
		}, {});

		const outcomes = Object.entries(outcomeCount)
			.map(([name, value]) => ({
				name,
				value,
				percentage: Math.round((value / total) * 100),
			}))
			.sort((a, b) => b.value - a.value);

		// Demographics
		const ageCount = records.reduce((acc: Record<string, number>, record) => {
			const age = record.age_range || "Not specified";
			acc[age] = (acc[age] || 0) + 1;
			return acc;
		}, {});

		const genderCount = records.reduce((acc: Record<string, number>, record) => {
			const gender = record.gender || "Not specified";
			acc[gender] = (acc[gender] || 0) + 1;
			return acc;
		}, {});

		const ethnicityCount = records.reduce((acc: Record<string, number>, record) => {
			const ethnicity = record.self_defined_ethnicity || "Not specified";
			acc[ethnicity] = (acc[ethnicity] || 0) + 1;
			return acc;
		}, {});

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

	const getCurrentForceName = () => {
		const force = forces.find((f) => f.id === selectedForce);
		return force ? force.name : selectedForce;
	};

	const getFormattedMonth = () => {
		if (!selectedMonth) return "No month selected";
		try {
			const date = new Date(selectedMonth + "-01");
			return date.toLocaleDateString("en-GB", {
				year: "numeric",
				month: "long",
			});
		} catch {
			return selectedMonth;
		}
	};

	// Initialize forces and data
	useEffect(() => {
		fetchForces();
	}, []);

	// Watch for URL changes and fetch data accordingly
	useEffect(() => {
		if (selectedMonth && selectedForce) {
			fetchData(selectedMonth, selectedForce);
		}
	}, [selectedForce, selectedMonth, fetchData]);

	// Show loading state
	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
				<Box textAlign="center">
					<CircularProgress size={48} sx={{ mb: 2 }} />
					<Typography variant="h6" color="text.secondary">
						Loading {getCurrentForceName()} data for {getFormattedMonth()}...
					</Typography>
				</Box>
			</Box>
		);
	}

	// Show empty state
	const showEmptyState = !selectedMonth || !selectedForce || stats.total === 0;

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
				{/* Stats Cards */}
				<Grid size={{ xs: 6, lg: 3 }}>
					<StatsCard
						title="Total Stop & Searches"
						value={stats.total.toLocaleString()}
						trend="info"
						trendValue="100%"
					/>
				</Grid>
				<Grid size={{ xs: 6, lg: 3 }}>
					<StatsCard
						title="Search Types"
						value={stats.searchTypes.length.toString()}
						trend="success"
						trendValue={`${stats.searchTypes.length} types`}
					/>
				</Grid>
				<Grid size={{ xs: 6, lg: 3 }}>
					<StatsCard
						title="Unique Outcomes"
						value={stats.outcomes.length.toString()}
						trend="warning"
						trendValue={`${stats.outcomes.length} outcomes`}
					/>
				</Grid>
				<Grid size={{ xs: 6, lg: 3 }}>
					<StatsCard
						title="Data Period"
						value={getFormattedMonth()}
						trend="info"
						trendValue={getCurrentForceName()}
					/>
				</Grid>

				{/* Charts */}
				<Grid size={{ xs: 12, lg: 6 }}>
					<GenderDistribution data={stats.demographics.gender} />
				</Grid>

				<Grid size={{ xs: 12, lg: 6 }}>
					<AgeDistribution data={stats.demographics.ageRange} />
				</Grid>

				<Grid size={{ xs: 12, lg: 6 }}>
					<SearchTypes data={stats.searchTypes} />
				</Grid>

				<Grid size={{ xs: 12, lg: 6 }}>
					<SearchOutcomes data={stats.outcomes} />
				</Grid>

				<Grid size={{ xs: 12 }}>
					<EthnicityDistribution data={stats.demographics.ethnicity} />
				</Grid>

				{/* Table */}
				<Grid size={{ xs: 12 }}>
					<TableRecords
						data={data}
						forceName={getCurrentForceName()}
						month={getFormattedMonth()}
					/>
				</Grid>
			</Grid>
		</Box>
	);
}
