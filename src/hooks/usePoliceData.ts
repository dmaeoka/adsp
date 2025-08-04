// hooks/usePoliceData.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { PoliceDataService } from "../utils/dataService";
import { ProcessedStopSearchRecord, DataStats } from "../types";

interface UsePoliceDataResult {
	data: ProcessedStopSearchRecord[];
	filteredData: ProcessedStopSearchRecord[];
	stats: DataStats;
	isLoading: boolean;
	error: string | null;
	filters: FilterState;
	setFilters: (filters: Partial<FilterState>) => void;
	resetFilters: () => void;
	filterOptions: FilterOptions;
}

interface FilterState {
	dateRange: { start: string; end: string };
	searchType: string[];
	ageRange: string[];
	gender: string[];
	ethnicity: string[];
	outcome: string[];
	objectOfSearch: string[];
	searchText: string;
}

interface FilterOptions {
	searchTypes: string[];
	ageRanges: string[];
	genders: string[];
	ethnicities: string[];
	outcomes: string[];
	objectsOfSearch: string[];
}

const initialFilters: FilterState = {
	dateRange: { start: "", end: "" },
	searchType: [],
	ageRange: [],
	gender: [],
	ethnicity: [],
	outcome: [],
	objectOfSearch: [],
	searchText: "",
};

// Helper function to filter out null values and ensure string array
function filterNullValues(arr: (string | null)[]): string[] {
	return arr.filter(
		(item): item is string => item !== null && item !== undefined,
	);
}

export function usePoliceData(): UsePoliceDataResult {
	const [data, setData] = useState<ProcessedStopSearchRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFiltersState] = useState<FilterState>(initialFilters);

	// Load data on mount
	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const result = await PoliceDataService.fetchAllHistoricalData();
				setData(result);

				// Set default date range to cover all data
				if (result.length > 0) {
					const sortedData = [...result].sort(
						(a, b) => a.date.getTime() - b.date.getTime(),
					);
					setFiltersState((prev) => ({
						...prev,
						dateRange: {
							start: sortedData[0].date
								.toISOString()
								.split("T")[0],
							end: sortedData[sortedData.length - 1].date
								.toISOString()
								.split("T")[0],
						},
					}));
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load data",
				);
				console.error("Error loading police data:", err);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, []);

	// Filter options based on available data
	const filterOptions = useMemo((): FilterOptions => {
		if (data.length === 0) {
			return {
				searchTypes: [],
				ageRanges: [],
				genders: [],
				ethnicities: [],
				outcomes: [],
				objectsOfSearch: [],
			};
		}

		const rawOptions = PoliceDataService.getFilterOptions(data);

		// Filter out null values from each array
		return {
			searchTypes: filterNullValues(rawOptions.searchTypes),
			ageRanges: filterNullValues(rawOptions.ageRanges),
			genders: filterNullValues(rawOptions.genders),
			ethnicities: filterNullValues(rawOptions.ethnicities),
			outcomes: filterNullValues(rawOptions.outcomes),
			objectsOfSearch: filterNullValues(rawOptions.objectsOfSearch),
		};
	}, [data]);

	// Apply filters to data
	const filteredData = useMemo(() => {
		let result = data;

		// Apply filters
		result = PoliceDataService.filterData(result, {
			dateRange:
				filters.dateRange.start && filters.dateRange.end
					? filters.dateRange
					: undefined,
			searchType:
				filters.searchType.length > 0 ? filters.searchType : undefined,
			ageRange:
				filters.ageRange.length > 0 ? filters.ageRange : undefined,
			gender: filters.gender.length > 0 ? filters.gender : undefined,
			ethnicity:
				filters.ethnicity.length > 0 ? filters.ethnicity : undefined,
			outcome: filters.outcome.length > 0 ? filters.outcome : undefined,
			objectOfSearch:
				filters.objectOfSearch.length > 0
					? filters.objectOfSearch
					: undefined,
		});

		// Apply text search
		if (filters.searchText.trim()) {
			const searchTerm = filters.searchText.toLowerCase();
			result = result.filter(
				(record) =>
					record.location?.street?.name
						?.toLowerCase()
						.includes(searchTerm) ||
					record.object_of_search
						?.toLowerCase()
						.includes(searchTerm) ||
					record.outcome?.toLowerCase().includes(searchTerm) ||
					record.type.toLowerCase().includes(searchTerm),
			);
		}

		return result;
	}, [data, filters]);

	// Generate stats from filtered data
	const stats = useMemo(() => {
		return PoliceDataService.generateStats(filteredData);
	}, [filteredData]);

	// Update filters
	const setFilters = useCallback((newFilters: Partial<FilterState>) => {
		setFiltersState((prev) => ({ ...prev, ...newFilters }));
	}, []);

	// Reset filters
	const resetFilters = useCallback(() => {
		const resetState = { ...initialFilters };

		// Keep the date range if we have data
		if (data.length > 0) {
			const sortedData = [...data].sort(
				(a, b) => a.date.getTime() - b.date.getTime(),
			);
			resetState.dateRange = {
				start: sortedData[0].date.toISOString().split("T")[0],
				end: sortedData[sortedData.length - 1].date
					.toISOString()
					.split("T")[0],
			};
		}

		setFiltersState(resetState);
	}, [data]);

	return {
		data,
		filteredData,
		stats,
		isLoading,
		error,
		filters,
		setFilters,
		resetFilters,
		filterOptions,
	};
}
