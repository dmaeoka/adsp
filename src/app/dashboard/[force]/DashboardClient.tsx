// src/app/dashboard/[force]/DashboardClient.tsx
"use client";
import dynamic from "next/dynamic";

// Define the props interface
interface DashboardClientProps {
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

// Dynamically import the dashboard component for better performance
const PoliceDataDashboard = dynamic(
	() => import("../components/PoliceDataDashboard"),
	{
		loading: () => (
			<div>Loading dashboard...</div>
		),
		ssr: false,
	},
);

export default function DashboardClient({ initialParams }: DashboardClientProps) {
	return <PoliceDataDashboard initialParams={initialParams} />;
}
