// src/app/dashboard/[force]/DashboardClient.tsx
"use client";
import dynamic from "next/dynamic";

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

export default function DashboardClient() {
	return <PoliceDataDashboard />;
}
