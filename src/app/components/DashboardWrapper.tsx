// src/app/components/DashboardWrapper.tsx
"use client";

import PoliceDataDashboard from "./PoliceDataDashboard";

interface DashboardWrapperProps {
	initialParams?: {
		params: {
			force: string;
		};
		searchParams: {
			date?: string;
		};
	};
}

export default function DashboardWrapper({
	initialParams,
}: DashboardWrapperProps) {
	return <PoliceDataDashboard initialParams={initialParams} />;
}
