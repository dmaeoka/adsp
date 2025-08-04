// types/police.ts
export interface StopSearchLocation {
	latitude: string;
	longitude: string;
	street: {
		id: number;
		name: string;
	};
}

export interface OutcomeObject {
	id: string;
	name: string;
}

export interface StopSearchRecord {
	age_range: string | null;
	officer_defined_ethnicity: string | null;
	involved_person: boolean;
	self_defined_ethnicity: string | null;
	gender: string | null;
	legislation: string | null;
	outcome_linked_to_object_of_search: boolean | null;
	datetime: string;
	outcome_object: OutcomeObject | null;
	location: StopSearchLocation;
	object_of_search: string | null;
	operation: boolean | null;
	outcome: string | null;
	type: string;
	operation_name: string | null;
	removal_of_more_than_outer_clothing: boolean;
}

export interface ProcessedStopSearchRecord extends StopSearchRecord {
	id: string;
	date: Date;
	month: string;
	year: number;
	borough?: string;
}

export interface FilterOptions {
	dateRange: {
		start: string;
		end: string;
	};
	searchType: string[];
	ageRange: string[];
	gender: string[];
	ethnicity: string[];
	outcome: string[];
	objectOfSearch: string[];
}

export interface ChartData {
	name: string;
	value: number;
	percentage?: number;
}

export interface TimeSeriesData {
	date: string;
	count: number;
	month: string;
	year: number;
}

export interface ApiResponse {
	data: StopSearchRecord[];
	error?: string;
	month: string;
}

export interface DataStats {
	total: number;
	dateRange: {
		start: string;
		end: string;
	};
	searchTypes: ChartData[];
	outcomes: ChartData[];
	demographics: {
		ageRange: ChartData[];
		gender: ChartData[];
		ethnicity: ChartData[];
	};
	monthlyTrends: TimeSeriesData[];
}
