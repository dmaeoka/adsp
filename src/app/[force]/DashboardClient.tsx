// src/app/[force]/DashboardClient.tsx
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

// Dynamically import the dashboard wrapper for better performance
const DashboardWrapper = dynamic(
	() => import("../components/DashboardWrapper"),
	{
		loading: () => (
			<div>Loading dashboard...</div>
		),
		ssr: false,
	},
);

export default function DashboardClient({ initialParams }: DashboardClientProps) {
	return <DashboardWrapper initialParams={initialParams} />;
}
