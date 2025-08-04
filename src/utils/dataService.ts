import {
	StopSearchRecord,
	ProcessedStopSearchRecord,
	ApiResponse,
	DataStats,
	ChartData,
	TimeSeriesData,
} from "../types";

const API_BASE_URL = "https://data.police.uk/api";
const FORCE_ID = "metropolitan";

// Cache for API responses
const cache = new Map<string, ApiResponse>();

interface FilterOptions {
	searchTypes: (string | null)[];
	ageRanges: (string | null)[];
	genders: (string | null)[];
	ethnicities: (string | null)[];
	outcomes: (string | null)[];
	objectsOfSearch: (string | null)[];
}

export class PoliceDataService {
	/**
	 * Fetches stop and search data for a specific month
	 */
	static async fetchMonthData(
		year: number,
		month: number,
	): Promise<ApiResponse> {
		const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
		const cacheKey = `${FORCE_ID}-${monthStr}`;

		// Check cache first
		if (cache.has(cacheKey)) {
			return cache.get(cacheKey)!;
		}

		try {
			const url = `${API_BASE_URL}/stops-force?force=${FORCE_ID}&date=${monthStr}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(
					`API request failed: ${response.status} ${response.statusText}`,
				);
			}

			const data: StopSearchRecord[] = await response.json();

			const result: ApiResponse = {
				data,
				month: monthStr,
			};

			// Cache the response
			cache.set(cacheKey, result);

			return result;
		} catch (error) {
			console.error(`Error fetching data for ${monthStr}:`, error);
			return {
				data: [],
				error: error instanceof Error ? error.message : "Unknown error",
				month: monthStr,
			};
		}
	}

	/**
	 * Fetches all available historical data
	 */
	static async fetchAllHistoricalData(): Promise<
		ProcessedStopSearchRecord[]
	> {
		const allData: ProcessedStopSearchRecord[] = [];
		const currentDate = new Date();

		// Start from 2020 and go to current month
		// Note: The API has historical data limitations, we'll discover the actual range dynamically
		const startYear = 2020;
		const startMonth = 1;

		const promises: Promise<ApiResponse>[] = [];

		// Generate all month combinations
		for (let year = startYear; year <= currentDate.getFullYear(); year++) {
			const endMonth =
				year === currentDate.getFullYear()
					? currentDate.getMonth()
					: 11;
			const beginMonth = year === startYear ? startMonth - 1 : 0;

			for (let month = beginMonth; month <= endMonth; month++) {
				promises.push(this.fetchMonthData(year, month + 1));
			}
		}

		try {
			const responses = await Promise.allSettled(promises);

			responses.forEach((result) => {
				if (
					result.status === "fulfilled" &&
					result.value.data.length > 0
				) {
					const processedData = this.processRawData(
						result.value.data,
						result.value.month,
					);
					allData.push(...processedData);
				}
			});

			console.log(
				`Successfully fetched ${allData.length} records from ${responses.length} API calls`,
			);

			return allData.sort((a, b) => b.date.getTime() - a.date.getTime());
		} catch (error) {
			console.error("Error fetching historical data:", error);
			throw error;
		}
	}

	/**
	 * Processes raw API data into a more usable format
	 */
	static processRawData(
		rawData: StopSearchRecord[],
		month: string,
	): ProcessedStopSearchRecord[] {
		return rawData.map((record, index) => {
			const date = new Date(record.datetime);

			return {
				...record,
				id: `${month}-${index}-${date.getTime()}`,
				date,
				month,
				year: date.getFullYear(),
				// Extract borough from street name if possible
				borough: this.extractBorough(
					record.location?.street?.name || "",
				),
			};
		});
	}

	/**
	 * Extracts borough information from street name
	 */
	static extractBorough(streetName: string): string {
		// Simple extraction - in a real app, you'd have a proper mapping
		const boroughPatterns = [
			"Westminster",
			"Camden",
			"Islington",
			"Hackney",
			"Tower Hamlets",
			"Greenwich",
			"Lewisham",
			"Southwark",
			"Lambeth",
			"Wandsworth",
			"Hammersmith",
			"Kensington",
			"Chelsea",
			"Barnet",
			"Enfield",
			"Haringey",
			"Newham",
			"Redbridge",
			"Waltham Forest",
			"Brent",
			"Ealing",
			"Harrow",
			"Hillingdon",
			"Hounslow",
			"Richmond",
			"Kingston",
			"Merton",
			"Sutton",
			"Croydon",
			"Bromley",
			"Bexley",
			"Havering",
		];

		for (const borough of boroughPatterns) {
			if (streetName.toLowerCase().includes(borough.toLowerCase())) {
				return borough;
			}
		}

		return "Unknown";
	}

	/**
	 * Generates comprehensive statistics from the data
	 */
	static generateStats(data: ProcessedStopSearchRecord[]): DataStats {
		if (data.length === 0) {
			return {
				total: 0,
				dateRange: { start: "", end: "" },
				searchTypes: [],
				outcomes: [],
				demographics: { ageRange: [], gender: [], ethnicity: [] },
				monthlyTrends: [],
			};
		}

		const sortedData = Array.from(data).sort(
			(a, b) => a.date.getTime() - b.date.getTime(),
		);

		return {
			total: data.length,
			dateRange: {
				start: sortedData[0].date.toISOString().split("T")[0],
				end: sortedData[sortedData.length - 1].date
					.toISOString()
					.split("T")[0],
			},
			searchTypes: this.generateChartData(data, "type"),
			outcomes: this.generateChartData(data, "outcome"),
			demographics: {
				ageRange: this.generateChartData(data, "age_range"),
				gender: this.generateChartData(data, "gender"),
				ethnicity: this.generateChartData(
					data,
					"self_defined_ethnicity",
				),
			},
			monthlyTrends: this.generateMonthlyTrends(data),
		};
	}

	/**
	 * Generates chart data for a specific field
	 */
	static generateChartData(
		data: ProcessedStopSearchRecord[],
		field: keyof ProcessedStopSearchRecord,
	): ChartData[] {
		const counts = new Map<string, number>();

		data.forEach((record) => {
			const value = record[field];
			const key = value ? String(value) : "Unknown";
			counts.set(key, (counts.get(key) || 0) + 1);
		});

		const total = data.length;

		return Array.from(counts.entries())
			.map(([name, value]) => ({
				name,
				value,
				percentage: Math.round((value / total) * 100 * 100) / 100,
			}))
			.sort((a, b) => b.value - a.value);
	}

	/**
	 * Generates monthly trend data
	 */
	static generateMonthlyTrends(
		data: ProcessedStopSearchRecord[],
	): TimeSeriesData[] {
		const monthlyData = new Map<string, number>();

		data.forEach((record) => {
			const monthKey = record.month;
			monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
		});

		return Array.from(monthlyData.entries())
			.map(([date, count]) => {
				const [year, month] = date.split("-");
				return {
					date,
					count,
					month: new Date(
						parseInt(year),
						parseInt(month) - 1,
					).toLocaleString("default", { month: "short" }),
					year: parseInt(year),
				};
			})
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	/**
	 * Filters data based on provided criteria
	 */
	static filterData(
		data: ProcessedStopSearchRecord[],
		filters: Partial<{
			dateRange: { start: string; end: string };
			searchType: string[];
			ageRange: string[];
			gender: string[];
			ethnicity: string[];
			outcome: string[];
			objectOfSearch: string[];
		}>,
	): ProcessedStopSearchRecord[] {
		return data.filter((record) => {
			// Date range filter
			if (filters.dateRange) {
				const recordDate = record.date.toISOString().split("T")[0];
				if (
					recordDate < filters.dateRange.start ||
					recordDate > filters.dateRange.end
				) {
					return false;
				}
			}

			// Search type filter
			if (filters.searchType && filters.searchType.length > 0) {
				if (!filters.searchType.includes(record.type)) {
					return false;
				}
			}

			// Age range filter
			if (filters.ageRange && filters.ageRange.length > 0) {
				if (
					!record.age_range ||
					!filters.ageRange.includes(record.age_range)
				) {
					return false;
				}
			}

			// Gender filter
			if (filters.gender && filters.gender.length > 0) {
				if (!record.gender || !filters.gender.includes(record.gender)) {
					return false;
				}
			}

			// Ethnicity filter
			if (filters.ethnicity && filters.ethnicity.length > 0) {
				if (
					!record.self_defined_ethnicity ||
					!filters.ethnicity.includes(record.self_defined_ethnicity)
				) {
					return false;
				}
			}

			// Outcome filter
			if (filters.outcome && filters.outcome.length > 0) {
				if (
					!record.outcome ||
					!filters.outcome.includes(record.outcome)
				) {
					return false;
				}
			}

			// Object of search filter
			if (filters.objectOfSearch && filters.objectOfSearch.length > 0) {
				if (
					!record.object_of_search ||
					!filters.objectOfSearch.includes(record.object_of_search)
				) {
					return false;
				}
			}

			return true;
		});
	}

	/**
	 * Gets unique values for filter options
	 */
	static getFilterOptions(data: ProcessedStopSearchRecord[]): FilterOptions {
		return {
			searchTypes: Array.from(new Set(data.map((r) => r.type)))
				.filter(Boolean)
				.sort(),
			ageRanges: Array.from(new Set(data.map((r) => r.age_range)))
				.filter(Boolean)
				.sort(),
			genders: Array.from(new Set(data.map((r) => r.gender)))
				.filter(Boolean)
				.sort(),
			ethnicities: Array.from(new Set(data.map((r) => r.self_defined_ethnicity)))
				.filter(Boolean)
				.sort(),
			outcomes: Array.from(new Set(data.map((r) => r.outcome)))
				.filter(Boolean)
				.sort(),
			objectsOfSearch: Array.from(new Set(data.map((r) => r.object_of_search)))
				.filter(Boolean)
				.sort(),
		};
	}
}
